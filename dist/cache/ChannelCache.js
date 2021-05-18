"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
/**
 * Cache responsible for storing channel related data
 */
class ChannelCache extends BaseCache_1.default {
    /**
     * Create a new ChanneCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param storageEngine storage engine to use for this cache
     * @param channelMap Instantiated ChannelMap class
     * @param permissionOverwriteCache Instantiated PermissionOverwriteCache class
     * @param userCache Instantiated UserCache class
     * @param boundObject Optional, may be used to bind a channel object to this cache
     */
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
    /**
     * Get a channel via id
     * @param id id of the channel
     * @returns ChannelCache with bound object or null if nothing was found
     */
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
    /**
     * Upsert a channel into the cache
     * @param id id of the channel
     * @param data data to insert
     */
    async update(id, data) {
        var _a, _b;
        if (this.boundObject) {
            this.bindObject(data); //using bindobject() to assure the data of the class is valid
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
    /**
     * Remove a channel from the cache
     * @param id id of the channel
     */
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
    /**
     * Filter through the collection of channels
     * @param fn Filter function
     * @param channelMap Array of ids used for the filter
     * @returns array of channel caches with bound results
     */
    async filter(fn, channelMap) {
        var _a;
        const channels = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.filter(fn, channelMap, this.namespace)) || [];
        return channels.map(c => new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(c.id), this.recipients, this.rain, c));
    }
    /**
     * Filter through the collection of channels and return on the first result
     * @param fn Filter function
     * @param channelMap Array of ids used for the filter
     * @returns First result bound to a channel cache
     */
    async find(fn, channelMap) {
        var _a;
        const channel = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.find(fn, channelMap, this.namespace));
        if (!channel)
            return null;
        return new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(channel.id), this.recipients, this.rain, channel);
    }
    /**
     * Add channels to the channel index
     * @param id ids of the channels
     */
    async addToIndex(id) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.addToList(this.namespace, id);
    }
    /**
     * Remove a channel from the index
     * @param id id of the channel
     */
    async removeFromIndex(id) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.removeFromList(this.namespace, id);
    }
    /**
     * Check if a channel is indexed
     * @param id - id of the channel
     */
    async isIndexed(id) {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.isListMember(this.namespace, id)) || false;
    }
    /**
     * Get a list of ids of indexed channels
     */
    async getIndexMembers() {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.getListMembers(this.namespace)) || [];
    }
    /**
     * Remove the channel index, you should probably not call this at all :<
     */
    async removeIndex() {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.removeList(this.namespace);
    }
    /**
     * Get the number of channels that are currently cached
     * @returns Number of channels currently cached
     */
    async getIndexCount() {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.getListCount(this.namespace)) || 0;
    }
}
module.exports = ChannelCache;
