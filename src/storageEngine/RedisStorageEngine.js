'use strict';
let BaseStorageEngine = require('./BaseStorageEngine');
let redis = require('redis');
const promisifyAll = require('tsubaki').promisifyAll;
promisifyAll(redis.RedisClient.prototype);
promisifyAll(redis.Multi.prototype);

class RedisStorageEngine extends BaseStorageEngine {
    constructor(options) {
        super();
        this.client = null;
        this.ready = false;
        this.useHash = options.useHash || false;
        this.options = options;
    }

    initialize() {
        return new Promise((res) => {
            this.client = redis.createClient(this.options);
            this.client.once('ready', () => {
                this.ready = true;
                return res();
            });
        });

    }

    async get(id, useHash = this.useHash) {
        if (useHash) {
            return this.client.hgetallAsync(id);
        } else {
            let rawData = await this.client.getAsync(id);
            return this.parseData(rawData);
        }
    }

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

    async remove(id, useHash = this.useHash) {
        if (useHash) {
            let hashKeys = await this.client.hkeysAsync(id);
            return this.client.hdelAsync(id, hashKeys);
        } else {
            return this.client.delAsync(id);
        }
    }

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

    async getListMembers(listId) {
        return this.client.smembersAsync(listId);
    }

    async addToList(listId, ids) {
        return this.client.saddAsync(listId, ids);
    }

    async isListMember(id, listId) {
        return this.client.sismemberAsync(listId, id);
    }

    async removeFromList(id, listId) {
        return this.client.sremAsync(listId, id);
    }

    async removeList(listId) {
        return this.remove(listId, false);
    }

    async getListCount(listId) {
        return this.client.scardAsync(listId);
    }

    prepareData(data) {
        return JSON.stringify(data);
    }

    parseData(data) {
        return data ? JSON.parse(data) : null;
    }

    prepareNamespace(namespace) {
        return namespace.endsWith('*') ? namespace : namespace + '*';
    }
}

module.exports = RedisStorageEngine;
