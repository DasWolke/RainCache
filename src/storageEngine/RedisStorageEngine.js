'use strict';
let BaseStorageEngine = require('./BaseStorageEngine');
let redis = require('redis');
const promisifyAll = require('tsubaki').promisifyAll;
promisifyAll(redis.RedisClient.prototype);
promisifyAll(redis.Multi.prototype);

/**
 * StorageEngine which uses redis as a datasource
 * @extends BaseStorageEngine
 */
class RedisStorageEngine extends BaseStorageEngine {
    /**
     * Create a new redis storage engine
     * @param {Object} options
     * @param {Boolean} [options.useHash=false] - whether hash objects should be used for storing data
     * @property {Redis} client - redis client
     * @property {Boolean} ready - whether this storage engine is ready for usage
     * @property {Boolean} useHash - whether hash objects should be used for storing data
     * @property {Object} options - options that are passed to the redis client
     */
    constructor(options) {
        super();
        this.client = null;
        this.ready = false;
        this.useHash = options.useHash || false;
        this.options = options;
    }

    /**
     * Initialize the storage engine and create a connection to redis
     * @returns {Promise.<void>}
     */
    initialize() {
        return new Promise((res) => {
            this.client = redis.createClient(this.options);
            this.client.once('ready', () => {
                this.ready = true;
                return res();
            });
        });

    }

    /**
     * Get an object from the cache via id
     * @param {String} id - id of the object
     * @param {Boolean} useHash - whether to use hash objects for this action
     * @returns {Promise.<*>}
     */
    async get(id, useHash = this.useHash) {
        if (useHash) {
            return this.client.hgetallAsync(id);
        } else {
            let rawData = await this.client.getAsync(id);
            return this.parseData(rawData);
        }
    }

    /**
     * Batch get multiple objects by their ids
     * @param {String[]} ids - array of ids
     * @param {Boolean} useHash - whether to use hash objects for this action
     * @return {Promise.<*>}
     */
    async batchGet(ids, useHash = this.useHash) {
        if (useHash) {
            let transaction = this.client.multi();
            for (let id of ids) {
                transaction.hmgetall(id);
            }
            return transaction.execAsync();
        } else {
            let data = await this.client.mgetAsync(ids);
            return data.map(d => this.parseData(d));
        }
    }

    /**
     * Upsert an object into the cache
     * @param {String} id - id of the object
     * @param {Object} updateData - the new Data which get's merged with the old
     * @param {Boolean} useHash - whether to use hash objects for this action
     * @returns {Promise.<void>}
     */
    async upsert(id, updateData, useHash = this.useHash) {
        let data;
        if (useHash) {
            return this.client.hmsetAsync(id, updateData);
        } else {
            data = await this.get(id);
            data = data || {};
            Object.assign(data, updateData);
            return this.client.setAsync(id, this.prepareData(data));
        }
    }

    /**
     * Batch upsert objects into the cache
     *
     * **The order of the array of ids has to be equal to the order of the objects array**
     * @param {String[]} ids - array of ids
     * @param {Object[]} data - array of objects which should be saved into the cache
     * @param {Boolean} useHash - whether to use hash objects for this action
     * @return {Promise<void>}
     */
    async batchUpsert(ids, data, useHash = this.useHash) {
        if (useHash) {
            let transaction = this.client.multi();
            ids.forEach((id, index) => {
                transaction.hmsetAsync(id, data[index]);
            });
            return transaction.execAsync();
        } else {
            let cachedDataArray = await this.batchGet(ids);
            let args = [];
            ids.forEach((id, index) => {
                let cachedData = cachedDataArray[index];
                if (!cachedData) {
                    cachedData = {};
                }
                data = Object.assign(cachedData, data[index]);
                args.push(id, this.prepareData(data));
            });
            return this.client.msetAsync(...args);
        }
    }

    /**
     * Remove an object from the cache
     * @param {String} id - id of the object
     * @returns {Promise.<void>}
     */
    async remove(id) {
        return this.client.delAsync(id);
    }

    /**
     * Remove multiple objects from the cache
     * @param {String[]} ids - ids of the objects to remove
     * @returns {Promise.<void>}
     */
    async batchRemove(ids) {
        return this.client.delAsync(ids);
    }

    /**
     * Filter for an object
     * @param {Function} fn - filter function to use
     * @param {String[]} ids - array of ids that should be used for the filtering
     * @param {String} namespace - namespace of the filter
     * @returns {Promise.<Array.<Object|null>>} - filtered data
     */
    async filter(fn, ids, namespace) {
        let data = [];
        if (!ids) {
            data = await this.getListMembers(namespace);
        } else {
            data = ids;
        }
        data = data.map(id => `${namespace}.${id}`);
        let resolvedDataArray = this.batchGet(data);
        return resolvedDataArray.filter(fn);
    }

    /**
     * Filter for an object and return after the first search success
     * @param {Function} fn - filter function to use
     * @param {String[]} ids - array of ids that should be used for the filtering
     * @param {String} namespace - namespace of the filter
     * @returns {Promise.<Object|null>} - the first result or null if nothing was found
     */
    async find(fn, ids = null, namespace) {
        let data = [];
        if (typeof ids === 'string' && !namespace) {
            namespace = ids;
            ids = null;
        }
        if (!ids) {
            data = await this.getListMembers(namespace);
        } else {
            data = ids;
        }
        data = data.map(id => `${namespace}.${id}`);
        let resolvedDataArray = this.batchGet(data);
        for (let item of resolvedDataArray) {
            if (fn(item)) {
                return item;
            }
        }
    }

    /**
     * Get a list of values that are part of a list
     * @param {String} listId - id of the list
     * @returns {Promise.<String[]>} - array of ids that are members of the list
     */
    async getListMembers(listId) {
        return this.client.smembersAsync(listId);
    }

    /**
     * Add an id (or a list of them) to a list
     * @param {String} listId - id of the list
     * @param {String[]} ids - array of ids that should be added
     * @returns {Promise.<void>}
     */
    async addToList(listId, ids) {
        return this.client.saddAsync(listId, ids);
    }

    /**
     * Check if an id is part of a list
     * @param {String} listId - id of the list
     * @param {String} id - id that should be checked
     * @returns {Promise.<boolean>}
     */
    async isListMember(listId, id) {
        let res = await this.client.sismemberAsync(listId, id);
        return res === 1;
    }

    /**
     * Remove an id from a list
     * @param {String} listId - id of the list
     * @param {String|String[]} id - id(s) that should be removed
     * @returns {Promise.<void>}
     */
    async removeFromList(listId, id) {
        return this.client.sremAsync(listId, id);
    }

    /**
     * Remove a list
     * @param {String} listId - id of the list
     * @returns {Promise.<void>}
     */
    async removeList(listId) {
        return this.remove(listId, false);
    }

    /**
     * Get the amount of items within a list
     * @param {String} listId - id of the list
     * @returns {Promise.<*>}
     */
    async getListCount(listId) {
        return this.client.scardAsync(listId);
    }

    /**
     * Prepare data for storage inside redis
     * @param data
     */
    prepareData(data) {
        return JSON.stringify(data);
    }

    /**
     * Parse loaded data
     * @param data
     * @returns {Object|null}
     */
    parseData(data) {
        return data ? JSON.parse(data) : null;
    }

    /**
     * Prepare a namespace for a KEYS operation by adding a * at the end
     * @param {String} namespace - namespace to prepare
     * @returns {string} namespace + *
     */
    prepareNamespace(namespace) {
        return namespace.endsWith('*') ? namespace : namespace + '*';
    }
}

module.exports = RedisStorageEngine;
