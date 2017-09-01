'use strict';
let BaseCache = require('./BaseCache');

class PresenceCache extends BaseCache {
    constructor(storageEngine, userCache, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = 'presence';
        this.users = userCache;
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    async get (id) {
        if (this.boundObject) {
            return this.boundObject;
        }
        let presence = await this.storageEngine.get(this.buildId(id));
        if (presence) {
            return new PresenceCache(this.storageEngine, this.users, presence);
        } else {
            return null;
        }
    }

    async update(id, data) {
        if (this.boundObject) {
            this.bindObject(data);
            await this.update(id, data);
            return this;
        }
        if (data.user) {
            await this.users.update(data.user.id, data.user);
            delete data.user;
        }
        await this.storageEngine.upsert(this.buildId(id), data);
        return new PresenceCache(this.storageEngine, this.users, data);
    }

    async remove(id) {
        if (this.boundObject) {
            return this.remove(this.boundObject.id);
        }
        let presence = await this.storageEngine.get(this.buildId(id));
        if (presence) {
            return this.storageEngine.remove(this.buildId(id));
        } else {
            return null;
        }
    }

}

module.exports = PresenceCache;
