"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
class ChannelCache extends BaseCache_1.default {
    constructor(storageEngine, channelMap, permissionOverwriteCache, userCache, rain, boundObject) {
        super(rain);
        this.storageEngine = storageEngine;
        this.namespace = "channel";
        this.channelMap = channelMap;
        this.permissionOverwrites = permissionOverwriteCache;
        this.recipients = userCache;
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    async get(id) {
        var _a;
        if (this.boundObject) {
            return this;
        }
        const channel = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id)));
        if (channel) {
            return new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(channel.id), this.recipients, this.rain, channel);
        }
        else {
            return null;
        }
    }
    async update(id, data) {
        var _a, _b;
        if (this.boundObject) {
            this.bindObject(data);
        }
        if (data.guild_id) {
            await this.channelMap.update(data.guild_id, [data.id]);
        }
        else if (data.recipients) {
            if (data.recipients[0]) {
                await this.channelMap.update(data.recipients[0].id, [data.id], "user");
            }
        }
        if (data.permission_overwrites) {
            for (const overwrite of data.permission_overwrites) {
                await this.permissionOverwrites.update(overwrite.id, id, overwrite);
            }
        }
        delete data.permission_overwrites;
        delete data.recipients;
        await this.addToIndex(id);
        await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.upsert(this.buildId(id), this.structurize(data)));
        if (this.boundObject)
            return this;
        const channel = await ((_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.get(this.buildId(id)));
        if (channel)
            return new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(channel.id), this.recipients, this.rain, channel);
        else
            return this;
    }
    async remove(id) {
        var _a, _b;
        const channel = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id)));
        if (channel) {
            await this.removeFromIndex(id);
            return (_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.remove(this.buildId(id));
        }
        else {
            return undefined;
        }
    }
    async filter(fn, channelMap) {
        var _a;
        const channels = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.filter(fn, channelMap, this.namespace)) || [];
        return channels.map(c => new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(c.id), this.recipients, this.rain, c));
    }
    async find(fn, channelMap) {
        var _a;
        const channel = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.find(fn, channelMap, this.namespace));
        if (!channel)
            return null;
        return new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(channel.id), this.recipients, this.rain, channel);
    }
    async addToIndex(id) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.addToList(this.namespace, id);
    }
    async removeFromIndex(id) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.removeFromList(this.namespace, id);
    }
    async isIndexed(id) {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.isListMember(this.namespace, id)) || false;
    }
    async getIndexMembers() {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.getListMembers(this.namespace)) || [];
    }
    async removeIndex() {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.removeList(this.namespace);
    }
    async getIndexCount() {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.getListCount(this.namespace)) || 0;
    }
}
module.exports = ChannelCache;
