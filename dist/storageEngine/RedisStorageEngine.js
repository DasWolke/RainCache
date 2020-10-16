"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseStorageEngine_1 = __importDefault(require("./BaseStorageEngine"));
const redis_1 = __importDefault(require("redis"));
class RedisStorageEngine extends BaseStorageEngine_1.default {
    constructor(options = { useHash: false, redisOptions: { host: "localhost", port: 6379 } }) {
        super();
        this.client = null;
        this.ready = false;
        this.useHash = options.useHash;
        this.options = options;
    }
    initialize() {
        return new Promise((res) => {
            this.client = redis_1.default.createClient(this.options.redisOptions || undefined);
            this.client.once("ready", () => {
                this.ready = true;
                return res(undefined);
            });
        });
    }
    get(id, useHash = this.useHash) {
        return new Promise((res, rej) => {
            if (useHash) {
                return this.client?.HGETALL(id, (err, data) => {
                    if (err)
                        rej(err);
                    else
                        res(this.prepareData(data));
                });
            }
            else {
                return this.client?.GET(id, (err, data) => {
                    if (err)
                        return rej(err);
                    else
                        res(this.parseData(data));
                });
            }
        });
    }
    upsert(id, updateData, useHash = this.useHash) {
        let data;
        return new Promise(async (res, rej) => {
            if (useHash) {
                this.client?.HMSET(id, updateData, (err) => {
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
                this.client?.SET(id, this.prepareData(data), (err) => {
                    if (err)
                        void rej(err);
                    else
                        void res(undefined);
                });
            }
        });
    }
    remove(id, useHash = this.useHash) {
        return new Promise((res, rej) => {
            if (useHash) {
                this.client?.HKEYS(id, (err, hashKeys) => {
                    if (err)
                        void rej(err);
                    this.client?.HDEL(id, hashKeys, (e) => {
                        if (e)
                            void rej(e);
                        else
                            void res(undefined);
                    });
                });
            }
            else {
                this.client?.DEL(id, (err) => {
                    if (err)
                        void rej(err);
                    else
                        void res(undefined);
                });
            }
        });
    }
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
    getListMembers(listId) {
        return new Promise((res, rej) => {
            this.client?.SMEMBERS(listId, (err, data) => {
                if (err)
                    return rej(err);
                else
                    return res(data);
            });
        });
    }
    addToList(listId, ids) {
        return new Promise((res, rej) => {
            this.client?.SADD(listId, ids, (err) => {
                if (err)
                    void rej(err);
                else
                    void res(undefined);
            });
        });
    }
    isListMember(listId, id) {
        return new Promise((res, rej) => {
            this.client?.SISMEMBER(listId, id, (err, resp) => {
                if (err)
                    return rej(err);
                else
                    return res(resp === 1);
            });
        });
    }
    removeFromList(listId, id) {
        return new Promise((res, rej) => {
            this.client?.SREM(listId, id, (err) => {
                if (err)
                    void rej(err);
                else
                    void res(undefined);
            });
        });
    }
    removeList(listId) {
        return this.remove(listId, false);
    }
    getListCount(listId) {
        return new Promise((res, rej) => {
            this.client?.SCARD(listId, (err, resp) => {
                if (err)
                    return rej(err);
                else
                    return res(resp);
            });
        });
    }
    prepareData(data) {
        return JSON.stringify(data);
    }
    parseData(data) {
        return data ? JSON.parse(data) : null;
    }
    prepareNamespace(namespace) {
        return namespace.endsWith("*") ? namespace : namespace + "*";
    }
}
module.exports = RedisStorageEngine;
