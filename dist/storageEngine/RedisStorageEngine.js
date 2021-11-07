"use strict";
/* eslint-disable no-async-promise-executor */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseStorageEngine_1 = __importDefault(require("./BaseStorageEngine"));
const redis_1 = __importDefault(require("redis"));
/**
 * StorageEngine which uses redis as a datasource
 */
class RedisStorageEngine extends BaseStorageEngine_1.default {
    /**
     * Create a new redis storage engine
     */
    constructor(options = { useHash: false, redisOptions: { host: "localhost", port: 6379 } }) {
        super();
        this.client = null;
        this.ready = false;
        this.useHash = options.useHash || false;
        this.options = options;
    }
    /**
     * Initialize the storage engine and create a connection to redis
     */
    initialize() {
        return new Promise((res) => {
            this.client = redis_1.default.createClient(this.options.redisOptions || undefined);
            this.client.once("ready", () => {
                this.ready = true;
                return res(undefined);
            });
        });
    }
    /**
     * Get an object from the cache via id
     * @param id id of the object
     * @param useHash whether to use hash objects for this action
     */
    get(id, useHash = this.useHash) {
        return new Promise((res, rej) => {
            var _a, _b;
            if (useHash) {
                return (_a = this.client) === null || _a === void 0 ? void 0 : _a.HGETALL(id, (err, data) => {
                    if (err)
                        rej(err);
                    else
                        res(this.prepareData(data));
                });
            }
            else {
                return (_b = this.client) === null || _b === void 0 ? void 0 : _b.GET(id, (err, data) => {
                    if (err)
                        return rej(err);
                    else
                        res(this.parseData(data));
                });
            }
        });
    }
    /**
     * Upsert an object into the cache
     * @param id id of the object
     * @param updateData the new Data which get's merged with the old
     * @param useHash whether to use hash objects for this action
     */
    upsert(id, updateData, useHash = this.useHash) {
        let data;
        return new Promise(async (res, rej) => {
            var _a, _b;
            if (useHash) {
                (_a = this.client) === null || _a === void 0 ? void 0 : _a.HMSET(id, updateData, (err) => {
                    if (err)
                        void rej(err);
                    else
                        void res(undefined);
                });
            }
            else {
                try {
                    data = await this.get(id);
                }
                catch (e) {
                    rej(e);
                }
                data = data || {};
                Object.assign(data, updateData);
                (_b = this.client) === null || _b === void 0 ? void 0 : _b.SET(id, this.prepareData(data), (err) => {
                    if (err)
                        void rej(err);
                    else
                        void res(undefined);
                });
            }
        });
    }
    /**
     * Remove an object from the cache
     * @param id id of the object
     * @param useHash whether to use hash objects for this action
     */
    remove(id, useHash = this.useHash) {
        return new Promise((res, rej) => {
            var _a, _b;
            if (useHash) {
                (_a = this.client) === null || _a === void 0 ? void 0 : _a.HKEYS(id, (err, hashKeys) => {
                    var _a;
                    if (err)
                        void rej(err);
                    (_a = this.client) === null || _a === void 0 ? void 0 : _a.HDEL(id, hashKeys, (e) => {
                        if (e)
                            void rej(e);
                        else
                            void res(undefined);
                    });
                });
            }
            else {
                (_b = this.client) === null || _b === void 0 ? void 0 : _b.DEL(id, (err) => {
                    if (err)
                        void rej(err);
                    else
                        void res(undefined);
                });
            }
        });
    }
    /**
     * Filter for an object
     * @param fn filter function to use
     * @param ids array of ids that should be used for the filtering
     * @param namespace namespace of the filter
     * @returns filtered data
     */
    async filter(fn, ids, namespace) {
        const resolvedDataArray = [];
        let data = [];
        if (!ids) {
            data = await this.getListMembers(namespace);
        }
        else {
            data = ids;
        }
        data = data.map(id => `${namespace}.${id}`);
        for (const key of data) {
            const resolvedData = await this.get(key);
            if (resolvedData)
                resolvedDataArray.push(resolvedData);
        }
        return resolvedDataArray.filter(fn);
    }
    /**
     * Filter for an object and return after the first search success
     * @param fn filter function to use
     * @param ids array of ids that should be used for the filtering
     * @param namespace namespace of the filter
     * @returns the first result or null if nothing was found
     */
    async find(fn, ids = null, namespace) {
        let data = [];
        if (typeof ids === "string" && !namespace) {
            namespace = ids;
            ids = null;
        }
        if (!ids) {
            data = await this.getListMembers(namespace);
        }
        else {
            data = ids;
        }
        data = data.map(id => `${namespace}.${id}`);
        let index = 0;
        for (const key of data) {
            const resolvedData = await this.get(key);
            if (resolvedData && fn(resolvedData, index, data)) {
                return resolvedData;
            }
            index++;
        }
        return null;
    }
    /**
     * Get a list of values that are part of a list
     * @param listId id of the list
     * @returns array of ids that are members of the list
     */
    getListMembers(listId) {
        return new Promise((res, rej) => {
            var _a;
            (_a = this.client) === null || _a === void 0 ? void 0 : _a.SMEMBERS(listId, (err, data) => {
                if (err)
                    return rej(err);
                else
                    return res(data);
            });
        });
    }
    /**
     * Add an id (or a list of them) to a list
     * @param listId id of the list
     * @param id array of ids that should be added
     */
    addToList(listId, id) {
        return new Promise((res, rej) => {
            var _a;
            (_a = this.client) === null || _a === void 0 ? void 0 : _a.SADD(listId, id, (err) => {
                if (err)
                    void rej(err);
                else
                    void res(undefined);
            });
        });
    }
    /**
     * Check if an id is part of a list
     * @param listId id of the list
     * @param id id that should be checked
     */
    isListMember(listId, id) {
        return new Promise((res, rej) => {
            var _a;
            (_a = this.client) === null || _a === void 0 ? void 0 : _a.SISMEMBER(listId, id, (err, resp) => {
                if (err)
                    return rej(err);
                else
                    return res(resp === 1);
            });
        });
    }
    /**
     * Remove an id from a list
     * @param listId id of the list
     * @param id id that should be removed
     */
    removeFromList(listId, id) {
        return new Promise((res, rej) => {
            var _a;
            (_a = this.client) === null || _a === void 0 ? void 0 : _a.SREM(listId, id, (err) => {
                if (err)
                    void rej(err);
                else
                    void res(undefined);
            });
        });
    }
    /**
     * Remove a list
     * @param listId id of the list
     */
    removeList(listId) {
        return this.remove(listId, false);
    }
    /**
     * Get the amount of items within a list
     * @param listId id of the list
     */
    getListCount(listId) {
        return new Promise((res, rej) => {
            var _a;
            (_a = this.client) === null || _a === void 0 ? void 0 : _a.SCARD(listId, (err, resp) => {
                if (err)
                    return rej(err);
                else
                    return res(resp);
            });
        });
    }
    /**
     * Prepare data for storage inside redis
     */
    prepareData(data) {
        return JSON.stringify(data);
    }
    /**
     * Parse loaded data
     */
    parseData(data) {
        return data ? JSON.parse(data) : null;
    }
    /**
     * Prepare a namespace for a KEYS operation by adding a * at the end
     * @param namespace namespace to prepare
     * @returns namespace + *
     */
    prepareNamespace(namespace) {
        return namespace.endsWith("*") ? namespace : namespace + "*";
    }
}
module.exports = RedisStorageEngine;
