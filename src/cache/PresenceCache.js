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
     * @extends {BaseCache}
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

    /**
     * Batch get presences via user ids
     * @param {String[]} ids - Array of discord user ids
     * @return {Promise.<PresenceCache[]>} - Returns an array of PresenceCaches
     */
    async batchGet(ids) {
        let presences = await this.storageEngine.batchGet(ids.map(id => this.buildId(id)));
        return presences.map(p => new PresenceCache(this.storageEngine, this.users.bindUserId(id), p));
    }

    /**
     * Upsert the presence of a user.
     *
     * **This function automatically removes the guild_id, roles and user of a presence update before saving it**
     * @param {String} id - id of the user the presence belongs to
     * @param {Presence} data - updated presence data of the user
     * @return {Promise.<PresenceCache>} - returns a bound presence cache
     */
    async update(id, data) {
        if (this.boundObject) {
            this.bindObject(data);
            await this.update(id, data);
            return this;
        }
        if (data.guild_id) {
            delete data.guild_id;
        }
        if (data.roles) {
            delete data.roles;
        }
        if (data.user) {
            await this.users.update(data.user.id, data.user);
            delete data.user;
        }
        await this.storageEngine.upsert(this.buildId(id), data);
        return new PresenceCache(this.storageEngine, this.users, data);
    }

    /**
     * Batch update multiple presences
     * @param {String[]} ids - ids of the users the presences belong to
     * @param {Presence[]} data - updated presence data of the users
     * @return {Promise.<PresenceCache[]>} - returns an array of bound presence caches
     */
    async batchUpdate(ids, data) {
        let usersToUpdate = [];
        data = data.map(d => {
            if (d.guild_id) {
                delete d.guild_id;
            }
            if (d.roles) {
                delete d.roles;
            }
            if (d.user) {
                usersToUpdate.push(d.user);
                delete d.user;
            }
        });
        await this.users.batchUpdate(usersToUpdate.map(u => u.id), usersToUpdate);
        await this.storageEngine.batchUpsert(ids.map(id => this.buildId(id)), data);
        return data.map(d => new PresenceCache(this.storageEngine, this.users, d));
    }

    /**
     * Remove a stored presence from the cache
     * @param {String} id - id of the user the presence belongs to
     * @return {Promise.<void>}
     */
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

    /**
     * Batch remove stored presences from the cache
     * @param {String[]} ids - array of discord user ids
     * @return {Promise<void>}
     */
    async batchRemove(ids) {
        return this.storageEngine.batchRemove(ids.map(id => this.buildId(id)));
    }
}

/**
 * @typedef {Object} Presence - A discord presence object
 * @property {User} user - the user which presence is being updated
 * @property {String[]} roles - array of role ids that belong to the user
 * @property {Game} game - null or the current activity of the user
 * @property {String} guild_id - id of the guild
 * @property {String} status - status of the user, either "idle", "dnd", "online", or "offline"
 */

/**
 * @typedef {Object} Game - A discord game object
 * @property {String} name - name of the game
 * @property {Number} type - type of the game, checkout [activity types](https://discordapp.com/developers/docs/topics/gateway#game-object-activity-types) for more info
 * @property {String} ?url - stream url, only present with a type value of 1
 */

module.exports = PresenceCache;
