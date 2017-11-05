'use strict';
let BaseCache = require('./BaseCache');

/**
 * Cache for providing a guild/user -> channels map
 * @property {StorageEngine} storageEngine - storage engine to use for this cache
 * @property {String} namespace=channelmap - namespace of this cache
 */
class ChannelMapCache extends BaseCache {
    /**
     * Create a new ChannelMapCache
     * @param {StorageEngine} storageEngine - storage engine to use for this cache
     * @param {Object} boundObject - Optional, may be used to bind the map object to the cache
     */
    constructor(storageEngine, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = 'channelmap';
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    /**
     * Get a ChannelMap via id of the guild or the user
     * @param {String} id Id of the user or the guild
     * @param {String} [type=guild] Type of the map to get
     * @returns {Promise.<ChannelMapCache|null>}
     */
    async get(id, type = 'guild') {
        if (this.boundObject) {
            return this.boundObject;
        }
        let channelMapId = this.buildId(this._buildMapId(id, type));
        let channelMap = await this.storageEngine.getListMembers(channelMapId);
        if (channelMap) {
            return new ChannelMapCache(this.storageEngine, this._buildMap(id, channelMap, type));
        } else {
            return null;
        }
    }

    /**
     * Upsert a ChannelMap
     * @param {String} id Id of the user or the guild
     * @param {Array} data Array of channel ids
     * @param {String} [type=guild] Type of the map to upsert
     * @param {Boolean} [remove=false] Remove old channels that don't exist anymore
     * @returns {Promise.<ChannelMapCache>}
     */
    async update(id, data, type = 'guild', remove = false) {
        if (this.boundObject) {
            this.bindObject(this._buildMap(id, data, type)); //using bindobject() to assure the data of the class is valid
            await this.update(this.boundObject.id, data, this.boundObject.type);
            return this;
        }
        let oldCacheData = await this.get(id, type);
        if (oldCacheData && !remove) {
            data = this._checkDupes(oldCacheData.channels, data);
        }
        if (remove) {
            if (!oldCacheData) {
                oldCacheData = {channels: []};
            }
            data = this._removeOldChannels(oldCacheData.channels, data);
        }
        let channelMapId = this.buildId(this._buildMapId(id, type));
        await this.remove(id, type);
        await this.storageEngine.addToList(channelMapId, data);
        return new ChannelMapCache(this.storageEngine, this._buildMap(id, data, type));
    }

    /**
     * Remove a ChannelMap
     * @param {String} id Id of the user or the guild
     * @param {String} [type=guild] Type of the map to remove
     * @returns {Promise.<null>}
     */
    async remove(id, type = 'guild') {
        if (this.boundObject) {
            return this.storageEngine.remove(this.boundObject.id, this.boundObject.type);
        }
        let channelMapId = this.buildId(this._buildMapId(id, type));
        let channelMap = await this.storageEngine.getListMembers(channelMapId);
        if (channelMap) {
            return this.storageEngine.remove(channelMapId);
        } else {
            return null;
        }
    }

    /**
     * Remove old channels from the array of mapped channels
     * @param {Array} oldChannels Array of old channels
     * @param {Array} removeChannels Array of new channels
     * @returns {Array} Array of filtered channels
     * @private
     */
    _removeOldChannels(oldChannels, removeChannels) {
        for (let removeId of removeChannels) {
            if (oldChannels.indexOf(removeId) > -1) {
                oldChannels.splice(oldChannels.indexOf(removeId), 1);
            }
        }
        return oldChannels;
    }

    /**
     * Checks for duplicate ids in the provided arrays
     * @param {Array} oldIds Array of old ids
     * @param {Array} newIds Array of new ids
     * @returns {Array} Array of non duplicated Ids
     * @private
     */
    _checkDupes(oldIds, newIds) {
        for (let oldId of oldIds) {
            if (newIds.indexOf(oldId) > -1) {
                newIds.splice(newIds.indexOf(oldId), 1);
            }
        }
        return oldIds.concat(newIds);
    }

    /**
     * Build a unique key id for the channel map
     * @param {String} id - Id of the guild/user
     * @param {String} type - Type of the map
     * @returns {String}
     * @private
     */
    _buildMapId(id, type) {
        return `${type}.${id}`;
    }

    /**
     * Build a map object which is bound to the channelMapCache object
     * @param {String} id - Id of the guild/user
     * @param {Array} channels - Array of channel ids
     * @param {String} type - type of the map
     * @returns {{id: *, channels: *, type: *}}
     * @private
     */
    _buildMap(id, channels, type) {
        return {id, channels, type};
    }
}

module.exports = ChannelMapCache;
