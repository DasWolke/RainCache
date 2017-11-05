'use strict';
let BaseStorageEngine = require('./BaseStorageEngine');
let redis = require('redis');
const promisifyAll = require('tsubaki').promisifyAll;
promisifyAll(redis.RedisClient.prototype);
promisifyAll(redis.Multi.prototype);

/**
 * StorageEngine which uses redis as a datasource
 * @property {Redis} client - redis client
 * @property {Boolean} ready - whether this storage engine can be used
 * @property {Boolean} useHash - whether hash objects should be used for storing data
 * @property {Object} options - options that are passed to the redis client
 * @extends BaseStorageEngine
 */
class RedisStorageEngine extends BaseStorageEngine {
    /**
     * Create a new redis storage engine
     * @param {Object} options
     * @param {Boolean} [options.useHash=false] - whether hash objects should be used for storing data
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
     * Remove an object from the cache
     * @param {String} id - id of the object
     * @param {Boolean} useHash - whether to use hash objects for this action
     * @returns {Promise.<void>}
     */
    async remove(id, useHash = this.useHash) {
        if (useHash) {
            let hashKeys = await this.client.hkeysAsync(id);
            return this.client.hdelAsync(id, hashKeys);
        } else {
            return this.client.delAsync(id);
        }
    }

    /**
     * Filter for an object
     * @param {Function} fn - filter function to use
     * @param {String[]} ids - array of ids that should be used for the filtering
     * @param {String} namespace - namespace of the filter
     * @returns {Promise.<Array.<Object|null>>} - filtered data
     */
    async filter(fn, ids, namespace) {
        namespace = this.prepareNamespace(namespace);
        let resolvedDataArray = [];
        let data = [];
        if (!ids) {
            data = await this.client.keysAsync(namespace);
        } else {
            data = ids;
        }
        for (let key of data) {
            let resolvedData = await this.get(key);
            resolvedDataArray.push(resolvedData);
        }
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
        namespace = this.prepareNamespace(namespace);
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
        for (let key of data) {
            let resolvedData = await this.get(key);
            if (fn(resolvedData)) {
                return resolvedData;
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
     * @param {String} id - id that should be removed
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
