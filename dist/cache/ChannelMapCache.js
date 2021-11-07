"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
/**
 * Cache for providing a guild/user -> channels map
 */
class ChannelMapCache extends BaseCache_1.default {
    /**
     * Create a new ChannelMapCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param storageEngine storage engine to use for this cache
     * @param boundObject Optional, may be used to bind the map object to the cache
     */
    constructor(storageEngine, rain, boundObject) {
        super(rain);
        this.storageEngine = storageEngine;
        this.namespace = "channelmap";
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    /**
     * Get a ChannelMap via id of the guild or the user
     * @param id Id of the user or the guild
     * @param type Type of the map to get
     */
    async get(id, type = "guild") {
        var _a;
        if (this.boundObject) {
            return this;
        }
        const channelMapId = this.buildId(this._buildMapId(id, type));
        const channelMap = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.getListMembers(channelMapId));
        if (channelMap) {
            return new ChannelMapCache(this.storageEngine, this.rain, this._buildMap(id, channelMap, type));
        }
        else {
            return null;
        }
    }
    /**
     * Upsert a ChannelMap
     * @param id Id of the user or the guild
     * @param data Array of channel ids
     * @param type Type of the map to upsert
     * @param remove Remove old channels that don't exist anymore
     */
    async update(id, data, type = "guild", remove = false) {
        if (this.boundObject) {
            this.bindObject(this._buildMap(id, data, type)); //using bindobject() to assure the data of the class is valid
        }
        let oldCacheData = await this.get(id, type);
        if (oldCacheData && !remove) {
            data = this._checkDupes(oldCacheData.channels, data);
        }
        if (remove) {
            if (!oldCacheData) {
                oldCacheData = { channels: [] };
            }
            data = this._removeOldChannels(oldCacheData.channels, data);
        }
        const channelMapId = this.buildId(this._buildMapId(id, type));
        await this.remove(id, type);
        await Promise.all(data.map(i => { var _a; return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.addToList(channelMapId, i); }));
        if (this.boundObject)
            return this;
        return new ChannelMapCache(this.storageEngine, this.rain, this._buildMap(id, data, type));
    }
    /**
     * Remove a ChannelMap
     * @param {string} id Id of the user or the guild
     * @param {string} [type=guild] Type of the map to remove
     * @returns {Promise<null>}
     */
    async remove(id, type = "guild") {
        var _a, _b;
        const channelMapId = this.buildId(this._buildMapId(id, type));
        const channelMap = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.getListMembers(channelMapId));
        if (channelMap) {
            void ((_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.remove(channelMapId));
        }
        else {
            return undefined;
        }
    }
    /**
     * Remove old channels from the array of mapped channels
     * @param oldChannels Array of old channels
     * @param removeChannels Array of new channels
     * @returns Array of filtered channels
     */
    _removeOldChannels(oldChannels, removeChannels) {
        for (const removeId of removeChannels) {
            if (oldChannels.indexOf(removeId) > -1) {
                oldChannels.splice(oldChannels.indexOf(removeId), 1);
            }
        }
        return oldChannels;
    }
    /**
     * Checks for duplicate ids in the provided arrays
     * @param oldIds Array of old ids
     * @param newIds Array of new ids
     * @returns Array of non duplicated Ids
     */
    _checkDupes(oldIds, newIds) {
        for (const oldId of oldIds) {
            if (newIds.indexOf(oldId) > -1) {
                newIds.splice(newIds.indexOf(oldId), 1);
            }
        }
        return oldIds.concat(newIds);
    }
    /**
     * Build a unique key id for the channel map
     * @param id Id of the guild/user
     * @param type Type of the map
     */
    _buildMapId(id, type) {
        return `${type}.${id}`;
    }
    /**
     * Build a map object which is bound to the channelMapCache object
     * @param id Id of the guild/user
     * @param channels Array of channel ids
     * @param type - type of the map
     */
    _buildMap(id, channels, type) {
        return { id, channels, type };
    }
}
module.exports = ChannelMapCache;
