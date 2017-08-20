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
        this.namespace = options.namespace;
        this.useHash = options.useHash;
    }

    initialize(options) {
        return new Promise((res) => {
            this.client = redis.createClient(options);
            this.client.once('ready', () => {
                this.ready = true;
                return res();
            });
        });

    }

    async get (id) {
        if (this.useHash) {
            return this.client.hgetallAsync(id);
        } else {
            let rawData = await this.client.getAsync(this.buildKey(id));
            return this.parseData(rawData);
        }
    }

    async upsert(id, updateData) {
        let data;
        if (this.useHash) {
            return this.client.hmsetAsync(this.buildKey(id), updateData);
        } else {
            data = await this.get(this.buildKey(id));
            data = data || {};
            Object.assign(data, updateData);
            return this.client.setAsync(this.buildKey(id), this.prepareData(data));
        }
    }

    async remove(id) {
        if (this.useHash) {
            let hashKeys = await this.client.hkeysAsync(this.buildKey(id));
            return this.client.hdelAsync(this.buildKey(id), hashKeys);
        } else {
            return this.client.deleteAsync(this.buildKey(id));
        }
    }

    async filter(fn) {
        let resolvedDataArray = [];
        let data = await this.client.keysAsync(`${this.namespace}`);
        for (let key of data) {
            let resolvedData;
            if (this.useHash) {
                resolvedData = await this.client.hgetallAsync(this.buildKey(key));
                resolvedDataArray.push(resolvedData);
            } else {
                resolvedData = await this.client.get(this.buildKey(key));
                resolvedDataArray.push(resolvedData);
            }
        }
        return resolvedDataArray.filter(fn);
    }

    async find(fn) {
        let data = await this.client.keysAsync(`${this.namespace}`);
        for (let key of data) {
            let resolvedData;
            if (this.useHash) {
                resolvedData = await this.client.hgetallAsync(this.buildKey(key));
            } else {
                resolvedData = await this.client.get(this.buildKey(key));
            }
            if (fn(resolvedData)) {
                return resolvedData;
            }
        }
    }

    buildKey(id) {
        return `${this.namespace}${id}`;
    }

    prepareData(data) {
        return JSON.stringify(data);
    }

    parseData(data) {
        return data ? JSON.parse(data) : null;
    }

    updateNamespace(namespace) {
        this.namespace = namespace;
    }
}

module.exports = RedisStorageEngine;
