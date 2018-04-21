'use strict';
let BaseCache = require('./BaseCache');

/**
 * Cache responsible for storing channel related data
 * @extends BaseCache
 */
class ChannelCache extends BaseCache {
    /**
     * Create a new ChanneCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param {StorageEngine} storageEngine - storage engine to use for this cache
     * @param {ChannelMapCache} channelMap - Instantiated ChannelMap class
     * @param {PermissionOverwriteCache} permissionOverwriteCache - Instantiated PermissionOverwriteCache class
     * @param {UserCache} userCache - Instantiated UserCache class
     * @param {Channel} [boundObject] - Optional, may be used to bind a channel object to this cache
     * @property {String} namespace=channel - namespace of the cache, defaults to `channel`
     * @property {ChannelMapCache} guildChannelMap - Instantiated ChannelMap class
     * @property {PermissionOverwriteCache} permissionOverwrites - Instantiated PermissionOverwrite class
     * @property {UserCache} recipients - Instantiated UserCache class
     * @extends {BaseCache}
     */
    constructor(storageEngine, channelMap, permissionOverwriteCache, userCache, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = 'channel';
        this.channelMap = channelMap;
        this.permissionOverwrites = permissionOverwriteCache;
        this.recipients = userCache;
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    /**
     * Get a channel via id
     * @param {String} id - id of the channel
     * @returns {Promise.<ChannelCache|null>} - ChannelCache with bound object or null if nothing was found
     */
    async get(id) {
        if (this.boundObject) {
            return this.boundObject;
        }
        let channel = await this.storageEngine.get(this.buildId(id));
        if (channel) {
            return new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(channel.id), this.recipients, channel);
        } else {
            return null;
        }
    }

    /**
     * Batch get a list of channels by their ids
     * @param {String[]} ids - id of the channel
     * @returns {Promise.<ChannelCache[]|Array>} - Array of ChannelCaches with bound objects or an empty array if nothing was found
     */
    async batchGet(ids) {
        let channels = await this.storageEngine.batchGet(ids.map(id => this.buildId(id)));
        return channels.map(c => new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(c.id), this.recipients, c));
    }

    /**
     * Upsert a channel into the cache
     * @param {String} id - id of the channel
     * @param {Object} data - data to insert
     * @returns {Promise.<ChannelCache>}
     */
    async update(id, data) {
        if (this.boundObject) {
            this.bindObject(data); //using bindobject() to assure the data of the class is valid
            await this.update(this.boundObject.id, data);
            return this;
        }
        if (data.guild_id) {
            await this.channelMap.update(data.guild_id, [data.id]);
        } else if (data.recipients) {
            if (data.recipients[0]) {
                await this.channelMap.update(data.recipients[0].id, [data.id], 'user');
            }
        }
        if (data.permission_overwrites && data.permission_overwrites.length > 0) {
            await this.permissionOverwrites.batchUpdate(data.permission_overwrites.map(p => p.id), id, data.permission_overwrites);
        }
        delete data.permission_overwrites;
        delete data.recipients;
        await this.addToIndex(id);
        await this.storageEngine.upsert(this.buildId(id), data);
        let channel = await this.storageEngine.get(this.buildId(id));
        return new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(channel.id), this.recipients, channel);
    }

    /**
     * Batch upsert a list of channels
     *
     * **The order of the array of ids has to be equal to the order of the objects array**
     * @param {String[]} ids - array of channel ids
     * @param {Channel[]} data - array of channel objects
     * @return {Promise<ChannelCache[]>}
     */
    async batchUpdate(ids, data) {
        let batchMap = {guild: {}, user: {}};
        let permissionOverwrites = [];
        ids.forEach((id, index) => {
            if (data[index].guild_id) {
                let guildId = data[index].guild_id;
                batchMap = this._addToBatchMapArray(batchMap, 'guild', guildId, id);
                if (data[index].permission_overwrites && data[index].permission_overwrites.length > 0) {
                    permissionOverwrites.push(this.permissionOverwrites.batchUpdate(data[index].permission_overwrites.map(p => p.id), id, data[index].permission_overwrites));
                }
            } else if (data[index].recipients) {
                if (data[index].recipients[0]) {
                    let userId = data[index].recipients[0].id;
                    batchMap = this._addToBatchMapArray(batchMap, 'user', userId, id);
                }
            }
        });
        let channelMapUpdates = [];
        for (let batchTypeKey of Object.keys(batchMap)) {
            for (let itemKey of Object.keys(batchMap[batchTypeKey])) {
                channelMapUpdates.push(this.channelMap.update(itemKey, batchMap[batchTypeKey][itemKey]));
            }
        }
        await Promise.all(channelMapUpdates);
        await Promise.all(permissionOverwrites);
        await this.addToIndex(ids);
        await this.storageEngine.batchUpsert(ids.map(id => this.buildId(id)), data);
        return data.map(d => new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(d.id), this.recipients, d));
    }

    /**
     * Remove a channel from the cache
     * @param {String} id - id of the channel
     * @returns {Promise.<void>}
     */
    async remove(id) {
        if (this.boundObject) {
            return this.remove(this.boundObject.id);
        }
        let channel = await this.storageEngine.get(this.buildId(id));
        if (channel) {
            await this.removeFromIndex(id);
            const permissionOverwrites = await this.permissionOverwrites.getIndexMembers(id);
            await this.permissionOverwrites.batchRemove(permissionOverwrites, id);
            await this.permissionOverwrites.removeIndex(id);
            return this.storageEngine.remove(this.buildId(id));
        } else {
            return null;
        }
    }

    /**
     * Batch remove channels from the cache
     * @param {String[]} ids - array of channel ids
     * @return {Promise.<void>}
     */
    async batchRemove(ids) {
        await this.removeFromIndex(ids);
        return this.storageEngine.batchRemove(ids.map(id => this.buildId(id)));
    }

    /**
     * Filter through the collection of channels
     * @param {Function} fn - Filter function
     * @param {String[]} channelMap - Array of ids used for the filter
     * @returns {Promise.<ChannelCache[]>} - array of channel caches with bound results
     */
    async filter(fn, channelMap) {
        let channels = await this.storageEngine.filter(fn, channelMap, this.namespace);
        return channels.map(c => new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(c.id), this.recipients, c));
    }

    /**
     * Filter through the collection of channels and return on the first result
     * @param {Function} fn - Filter function
     * @param {String[]} channelMap - Array of ids used for the filter
     * @returns {ChannelCache} - First result bound to a channel cache
     */
    async find(fn, channelMap) {
        let channel = await this.storageEngine.find(fn, channelMap, this.namespace);
        return new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(channel.id), this.recipients, channel);
    }

    /**
     * Add a channel to the channel index
     * @param {String} id - id of the channel
     * @returns {Promise.<void>}
     */
    async addToIndex(id) {
        return this.storageEngine.addToList(this.namespace, id);
    }

    /**
     * Remove a channel from the index
     * @param {String} id - id of the channel
     * @returns {Promise.<void>}
     */
    async removeFromIndex(id) {
        return this.storageEngine.removeFromList(this.namespace, id);
    }

    /**
     * Check if a channel is indexed
     * @param {String} id - id of the channel
     * @returns {Promise.<Boolean>}
     */
    async isIndexed(id) {
        return this.storageEngine.isListMember(this.namespace, id);
    }

    /**
     * Get a list of ids of indexed channels
     * @returns {Promise.<String[]>}
     */
    async getIndexMembers() {
        return this.storageEngine.getListMembers(this.namespace);
    }

    /**
     * Remove the channel index, you should probably not call this at all :<
     * @returns {Promise.<*>}
     */
    async removeIndex() {
        return this.storageEngine.removeList(this.namespace);
    }

    /**
     * Get the number of channels that are currently cached
     * @return {Promise.<Number>} - Number of channels currently cached
     */
    async getIndexCount() {
        return this.storageEngine.getListCount(this.namespace);
    }

    _addToBatchMapArray(mapObject, type, mapId, id) {
        if (!Array.isArray(mapObject[type][mapId])) {
            mapObject[type][mapId] = [id];
        } else {
            mapObject[type][mapId].push(id);
        }
        return mapObject;
    }
}

module.exports = ChannelCache;
