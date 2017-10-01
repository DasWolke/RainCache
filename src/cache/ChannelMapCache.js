'use strict';
let BaseCache = require('./BaseCache');

/**
 * Cache for providing a guild/user -> channels map
 */
class ChannelMapCache extends BaseCache {
    /**
     * Create a new ChannelMapCache
     * @param storageEngine - storage engine to use for this cache
     * @param boundObject - Optional, may be used to bind the map object to the cache
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
        let channelMap = await this.storageEngine.get(this.buildId(this._buildMapId(id, type)));
        if (channelMap) {
            return new ChannelMapCache(this.storageEngine, channelMap);
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
            data = this._buildMap(id, data, type);
            this.bindObject(data); //using bindobject() to assure the data of the class is valid
            await this.update(this.boundObject.id, data);
            return this;
        }
        let oldCacheData = await this.get(id, type);
        if (oldCacheData && !remove) {
            data = this._checkDupes(oldCacheData.channels, data);
        }
        if (remove) {
            if (!oldCacheData) {
                oldCacheData = {id: 'memes', channels: [], type};
            }
            data = this._removeOldChannels(oldCacheData.channels, data);
        }
        let channelMap = this._buildMap(id, data, type);
        await this.storageEngine.upsert(this.buildId(this._buildMapId(id, type)), channelMap);
        channelMap = await this.storageEngine.get(this.buildId(this._buildMapId(id, type)));
        return new ChannelMapCache(this.storageEngine, channelMap);
    }

    /**
     * Remove a ChannelMap
     * @param {String} id Id of the user or the guild
     * @param {String} [type=guild] Type of the map to remove
     * @returns {Promise.<null>}
     */
    async remove(id, type = 'guild') {
        if (this.boundObject) {
            return this.storageEngine.remove(this.boundObject.id);
        }
        let channelMap = await this.storageEngine.get(this.buildId(this._buildMapId(id, type)));
        if (channelMap) {
            return this.storageEngine.remove(channelMap.id);
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
     * Build a map object to save in the storage engine
     * @param {String} id - Id of the guild/user
     * @param {Array} data - Array of channel ids
     * @param {String} type - type of the map
     * @returns {{id: String, channels: Array, type: String}}
     * @private
     */
    _buildMap(id, data, type) {
        return {id: this._buildMapId(id, type), channels: data, type};
    }
}

module.exports = ChannelMapCache;
