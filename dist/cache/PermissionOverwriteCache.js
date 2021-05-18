"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
/**
 * Cache used for saving overwrites of permissions belonging to channels
 * @extends BaseCache
 */
class PermissionOverwriteCache extends BaseCache_1.default {
    /**
     * Create a new PermissionOverwriteCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param storageEngine Storage engine to use for this cache
     * @param boundObject Optional, may be used to bind a permission overwrite object to this cache
     */
    constructor(storageEngine, rain, boundObject) {
        super(rain);
        this.storageEngine = storageEngine;
        this.namespace = "permissionoverwrite";
        this.boundChannel = "";
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    /**
     * Get a permission overwrite via id
     * @param id id of the permission overwrite
     * @param channelId - id of the channel that belongs to the permission overwrite
     * @returns returns a bound permission overwrite cache or null if nothing was found
     */
    async get(id, channelId = this.boundChannel) {
        var _a;
        if (this.boundObject) {
            return this;
        }
        const permissionOverwrite = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id, channelId)));
        if (permissionOverwrite) {
            return new PermissionOverwriteCache(this.storageEngine, this.rain, permissionOverwrite);
        }
        else {
            return null;
        }
    }
    /**
     * Update a permission overwrite entry in the cache
     * @param id id of the permission overwrite
     * @param channelId id of the channel that belongs to the permission overwrite
     * @param data updated permission overwrite data, will be merged with the old data
     * @returns returns a bound permission overwrite cache
     */
    async update(id, channelId = this.boundChannel, data) {
        var _a;
        if (this.boundObject) {
            this.bindObject(data);
        }
        await super.addToIndex(id, channelId);
        await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.upsert(this.buildId(id, channelId), this.structurize(data)));
        if (this.boundObject)
            return this;
        return new PermissionOverwriteCache(this.storageEngine, this.rain, data);
    }
    /**
     * Remove a permission overwrite entry from the cache
     * @param id id of the permission overwrite
     * @param channelId id of the channel that belongs to the permission overwrite
     */
    async remove(id, channelId = this.boundChannel) {
        var _a, _b;
        const permissionOverwrite = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id, channelId)));
        if (permissionOverwrite) {
            await super.removeFromIndex(id, channelId);
            return (_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.remove(this.buildId(id, channelId));
        }
        else {
            return undefined;
        }
    }
    /**
     * Filter for permission overwrites by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for the filtering
     * @param channelId id of the channel that belongs to the permission overwrite
     * @param ids Array of permission overwrite ids, if omitted the permission overwrite index will be used
     * @returns returns an array of bound permission overwrite caches
     */
    async filter(fn, channelId = this.boundChannel, ids = undefined) {
        var _a;
        const permissionOverwrites = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.filter(fn, ids, super.buildId(channelId)));
        if (!permissionOverwrites)
            return [];
        return permissionOverwrites.map(p => new PermissionOverwriteCache(this.storageEngine, this.rain, p));
    }
    /**
     * Find a permission overwrite by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for the filtering
     * @param channelId id of the channel that belongs to the permission overwrite
     * @param ids Array of permission overwrite ids, if omitted the permission overwrite index will be used
     * @returns returns a bound permission overwrite cache
     */
    async find(fn, channelId = this.boundChannel, ids = undefined) {
        var _a;
        const permissionOverwrite = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.find(fn, ids, super.buildId(channelId)));
        if (!permissionOverwrite)
            return null;
        return new PermissionOverwriteCache(this.storageEngine, this.rain, permissionOverwrite);
    }
    /**
     * Build a unique key for storing the data in the datasource
     * @param permissionId id of the permission overwrite
     * @param channelId id of the channel that belongs to the permission overwrite
     */
    buildId(permissionId, channelId) {
        if (!channelId) {
            return super.buildId(permissionId);
        }
        return `${this.namespace}.${channelId}.${permissionId}`;
    }
    /**
     * Bind a channel id to this permission overwrite cache
     * @param channelId id of the channel that belongs to the permission overwrite
     * @returns returns a permission overwrite cache with boundChannel set to the passed channelId
     */
    bindChannel(channelId) {
        this.boundChannel = channelId;
        this.boundGuild = channelId;
        return this;
    }
}
module.exports = PermissionOverwriteCache;
