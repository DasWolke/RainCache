"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
class ChannelCache extends BaseCache_1.default {
    constructor(storageEngine, channelMap, permissionOverwriteCache, userCache, boundObject) {
        super();
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
        if (this.boundObject) {
            return this;
        }
        const channel = await this.storageEngine.get(this.buildId(id));
        if (channel) {
            return new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(channel.id), this.recipients, channel);
        }
        else {
            return null;
        }
    }
    async update(id, data) {
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
        await this.addToIndex([id]);
        await this.storageEngine.upsert(this.buildId(id), data);
        if (this.boundObject)
            return this;
        const channel = await this.storageEngine.get(this.buildId(id));
        if (channel)
            return new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(channel.id), this.recipients, channel);
        else
            return this;
    }
    async remove(id) {
        const channel = await this.storageEngine.get(this.buildId(id));
        if (channel) {
            await this.removeFromIndex(id);
            return this.storageEngine.remove(this.buildId(id));
        }
        else {
            return undefined;
        }
    }
    async filter(fn, channelMap) {
        const channels = await this.storageEngine.filter(fn, channelMap, this.namespace) || [];
        return channels.map(c => new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(c.id), this.recipients, c));
    }
    async find(fn, channelMap) {
        const channel = await this.storageEngine.find(fn, channelMap, this.namespace);
        if (!channel)
            return null;
        return new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(channel.id), this.recipients, channel);
    }
    async addToIndex(ids) {
        return this.storageEngine.addToList(this.namespace, ids);
    }
    async removeFromIndex(id) {
        return this.storageEngine.removeFromList(this.namespace, id);
    }
    async isIndexed(id) {
        return this.storageEngine.isListMember(this.namespace, id) || false;
    }
    async getIndexMembers() {
        return this.storageEngine.getListMembers(this.namespace) || [];
    }
    async removeIndex() {
        return this.storageEngine.removeList(this.namespace);
    }
    async getIndexCount() {
        return this.storageEngine.getListCount(this.namespace) || 0;
    }
}
module.exports = ChannelCache;
