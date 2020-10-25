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
        var _a;
        if (this.boundObject) {
            return this;
        }
        const channelMapId = this.buildId(this._buildMapId(id, type));
        const channelMap = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.getListMembers(channelMapId));
        if (channelMap) {
            return new ChannelMapCache(this.storageEngine, this._buildMap(id, channelMap, type));
        }
        else {
            return null;
        }
    }
    async update(id, data, type = "guild", remove = false) {
        var _a;
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
        await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.addToList(channelMapId, data));
        if (this.boundObject)
            return this;
        return new ChannelMapCache(this.storageEngine, this._buildMap(id, data, type));
    }
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
