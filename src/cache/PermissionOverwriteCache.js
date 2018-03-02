'use strict';
const BaseCache = require('./BaseCache');

/**
 * Cache used for saving overwrites of permissions belonging to channels
 * @extends BaseCache
 */
class PermissionOverwriteCache extends BaseCache {
    /**
     * Create a new PermissionOverwriteCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param {StorageEngine} storageEngine - Storage engine to use for this cache
     * @param {PermissionOverwrite} [boundObject] - Optional, may be used to bind a permission overwrite object to this cache
     * @property {String} namespace=permissionoverwrite - namespace of the cache, defaults to `permissionoverwrite`
     */
    constructor(storageEngine, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = 'permissionoverwrite';
        this.boundChannel = '';
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    /**
     * Get a permission overwrite via id
     * @param {String} id - id of the permission overwrite
     * @param {String} channelId=this.boundChannel - id of the channel that belongs to the permission overwrite
     * @return {Promise.<PermissionOverwriteCache|null>} - returns a bound permission overwrite cache or null if nothing was found
     */
    async get(id, channelId = this.boundChannel) {
        if (this.boundObject) {
            return this.boundObject;
        }
        let permissionOverwrite = await this.storageEngine.get(this.buildId(id, channelId));
        if (permissionOverwrite) {
            return new PermissionOverwriteCache(this.storageEngine, permissionOverwrite);
        } else {
            return null;
        }
    }

    /**
     * Batch get a list of permission overwrites via their ids
     * @param {String[]} ids - array of permission overwrite ids
     * @param {String} channelId=this.boundChannel - id of the channel that belongs to the permission overwrites
     * @return {Promise.<PermissionOverwriteCache[]>} - returns an array of bound permission overwrite cache
     */
    async batchGet(ids, channelId = this.boundChannel) {
        let permissionOverwrites = await this.storageEngine.batchGet(ids.map(id => this.buildId(id, channelId)));
        return permissionOverwrites.map(p => new PermissionOverwriteCache(this.storageEngine, p));
    }

    /**
     * Update a permission overwrite entry in the cache
     * @param {String} id - id of the permission overwrite
     * @param {String} channelId=this.boundChannel - id of the channel that belongs to the permission overwrite
     * @param {PermissionOverwrite} data - updated permission overwrite data, will be merged with the old data
     * @return {Promise.<PermissionOverwriteCache>} - returns a bound permission overwrite cache
     */
    async update(id, channelId = this.boundChannel, data) {
        if (this.boundObject) {
            this.bindObject(data);
            await this.update(id, channelId, data);
            return this;
        }
        await super.addToIndex(id, channelId);
        await this.storageEngine.upsert(this.buildId(id, channelId), data);
        return new PermissionOverwriteCache(this.storageEngine, data);
    }

    /**
     * Batch update a list of permission overwrite entrys in the cache
     * @param {String[]} ids - array of permission overwrite ids
     * @param {String} channelId=this.boundChannel - id of the channel that belongs to the permission overwrite
     * @param {PermissionOverwrite[]} data - array of updated permission overwrite data, will be merged with the old data
     * @return {Promise.<PermissionOverwriteCache[]>} - returns an array containing bound permission overwrite caches
     */
    async batchUpdate(ids, channelId = this.boundChannel, data) {
        await super.addToIndex(ids, channelId);
        await this.storageEngine.batchUpsert(ids.map(id => this.buildId(id, channelId)), data);
        return data.map(d => new PermissionOverwriteCache(this.storageEngine, d));
    }

    /**
     * Remove a permission overwrite entry from the cache
     * @param {String} id - id of the permission overwrite
     * @param {String} channelId=this.boundChannel - id of the channel that belongs to the permission overwrite
     * @return {Promise.<void>}
     */
    async remove(id, channelId = this.boundChannel) {
        if (this.boundObject) {
            return this.remove(this.boundObject.id, channelId);
        }
        let permissionOverwrite = await this.storageEngine.get(this.buildId(id, channelId));
        if (permissionOverwrite) {
            await super.removeFromIndex(id, channelId);
            return this.storageEngine.remove(this.buildId(id, channelId));
        } else {
            return null;
        }
    }

    /**
     * Remove a list of permission overwrites from the cache
     * @param {String[]} ids - ids of the permission overwrites to be removed
     * @param {String} channelId=this.boundChannel - id of the channel that belongs to the permission overwrites
     * @return {Promise.<void>}
     */
    async batchRemove(ids, channelId = this.boundChannel) {
        await super.removeFromIndex(ids, channelId);
        return this.storageEngine.batchRemove(ids.map(id => this.buildId(id, channelId)));
    }

    /**
     * Filter for permission overwrites by providing a filter function which returns true upon success and false otherwise
     * @param {Function} fn - filter function to use for the filtering
     * @param {String} channelId=this.boundChannel - id of the channel that belongs to the permission overwrite
     * @param {String[]} ids - Array of permission overwrite ids, if omitted the permission overwrite index will be used
     * @return {Promise.<PermissionOverwriteCache[]>} - returns an array of bound permission overwrite caches
     */
    async filter(fn, channelId = this.boundChannel, ids = null) {
        let permissionOverwrites = await this.storageEngine.filter(fn, ids, super.buildId(channelId));
        return permissionOverwrites.map(p => new PermissionOverwriteCache(this.storageEngine, p));
    }

    /**
     * Find a permission overwrite by providing a filter function which returns true upon success and false otherwise
     * @param {Function} fn - filter function to use for the filtering
     * @param {String} channelId=this.boundChannel - id of the channel that belongs to the permission overwrite
     * @param {String[]} ids - Array of permission overwrite ids, if omitted the permission overwrite index will be used
     * @return {Promise.<PermissionOverwriteCache>} - returns a bound permission overwrite cache
     */
    async find(fn, channelId = this.boundChannel, ids = null) {
        let permissionOverwrite = await this.storageEngine.find(fn, ids, super.buildId(channelId));
        return new PermissionOverwriteCache(this.storageEngine, permissionOverwrite);
    }

    /**
     * Build a unique key for storing the data in the datasource
     * @param {String} permissionId - id of the permission overwrite
     * @param {String} channelId=this.boundChannel - id of the channel that belongs to the permission overwrite
     * @return {String} - id for saving the permission overwrite
     */
    buildId(permissionId, channelId) {
        if (!channelId) {
            return super.buildId(permissionId);
        }
        return `${this.namespace}.${channelId}.${permissionId}`;
    }

    /**
     * Bind a channel id to this permission overwrite cache
     * @param {String} channelId - id of the channel that belongs to the permission overwrite
     * @return {PermissionOverwriteCache} - returns a permission overwrite cache with boundChannel set to the passed channelId
     */
    bindChannel(channelId) {
        this.boundChannel = channelId;
        this.boundGuild = channelId;
        return this;
    }
}

module.exports = PermissionOverwriteCache;
