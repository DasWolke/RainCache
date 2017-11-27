'use strict';
let BaseCache = require('./BaseCache');

/**
 * Cache responsible for storing presence related data
 * @extends BaseCache
 */
class PresenceCache extends BaseCache {
    /**
     * Create a new Presence Cache
     *
     * **This class is automatically instantiated by RainCache**
     * @param {StorageEngine} storageEngine - Storage engine to use for this cache
     * @param {UserCache} userCache -
     * @param {Presence} boundObject - Optional, may be used to bind a presence object to the cache
     * @property {String} namespace=user - namespace of the cache
     */
    constructor(storageEngine, userCache, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = 'presence';
        this.users = userCache;
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    /**
     * Get a presence via user id
     * @param {String} id - id of a discord user
     * @return {Promise.<PresenceCache|null>} - Returns a new PresenceCache with bound data or null if nothing was found
     */
    async get(id) {
        if (this.boundObject) {
            return this.boundObject;
        }
        let presence = await this.storageEngine.get(this.buildId(id));
        if (presence) {
            return new PresenceCache(this.storageEngine, this.users.bindUserId(id), presence);
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
