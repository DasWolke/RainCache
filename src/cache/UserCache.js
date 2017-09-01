'use strict';
let BaseCache = require('./BaseCache');

class UserCache extends BaseCache {
    constructor(storageEngine, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = 'user';
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    async get (id) {
        if (this.boundObject) {
            return this.boundObject;
        }
        let user = await this.storageEngine.get(this.buildId(id));
        if (!user) {
            return null;
        }
        return new UserCache(this.storageEngine, user);
    }

    async update(id, data) {
        if (this.boundObject) {
            this.bindObject(data);
            await this.update(id, data);
            return this;
        }
        await this.storageEngine.upsert(this.buildId(id), data);
        return new UserCache(this.storageEngine, data);
    }

    async remove(id) {
        if (this.boundObject) {
            return this.remove(this.boundObject.id);
        }
        let user = await this.storageEngine.get(this.buildId(id));
        if (user) {
            return this.storageEngine.remove(this.buildId(id));
        } else {
            return null;
        }
    }
}

module.exports = UserCache;
