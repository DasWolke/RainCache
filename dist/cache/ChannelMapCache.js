"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
class ChannelMapCache extends BaseCache_1.default {
    constructor(storageEngine, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = "channelmap";
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    async get(id, type = "guild") {
        if (this.boundObject) {
            return this;
        }
        const channelMapId = this.buildId(this._buildMapId(id, type));
        const channelMap = await this.storageEngine.getListMembers(channelMapId);
        if (channelMap) {
            return new ChannelMapCache(this.storageEngine, this._buildMap(id, channelMap, type));
        }
        else {
            return null;
        }
    }
    async update(id, data, type = "guild", remove = false) {
        if (this.boundObject) {
            this.bindObject(this._buildMap(id, data, type));
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
        await this.storageEngine.addToList(channelMapId, data);
        if (this.boundObject)
            return this;
        return new ChannelMapCache(this.storageEngine, this._buildMap(id, data, type));
    }
    async remove(id, type = "guild") {
        const channelMapId = this.buildId(this._buildMapId(id, type));
        const channelMap = await this.storageEngine.getListMembers(channelMapId);
        if (channelMap) {
            void this.storageEngine.remove(channelMapId);
        }
        else {
            return undefined;
        }
    }
    _removeOldChannels(oldChannels, removeChannels) {
        for (const removeId of removeChannels) {
            if (oldChannels.indexOf(removeId) > -1) {
                oldChannels.splice(oldChannels.indexOf(removeId), 1);
            }
        }
        return oldChannels;
    }
    _checkDupes(oldIds, newIds) {
        for (const oldId of oldIds) {
            if (newIds.indexOf(oldId) > -1) {
                newIds.splice(newIds.indexOf(oldId), 1);
            }
        }
        return oldIds.concat(newIds);
    }
    _buildMapId(id, type) {
        return `${type}.${id}`;
    }
    _buildMap(id, channels, type) {
        return { id, channels, type };
    }
}
module.exports = ChannelMapCache;
