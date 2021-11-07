"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
/**
 * Cache responsible for storing presence related data
 */
class PresenceCache extends BaseCache_1.default {
    /**
     * Create a new Presence Cache
     *
     * **This class is automatically instantiated by RainCache**
     * @param storageEngine Storage engine to use for this cache
     * @param boundObject Optional, may be used to bind a presence object to the cache
     */
    constructor(storageEngine, userCache, rain, boundObject) {
        super(rain);
        this.storageEngine = storageEngine;
        this.namespace = "presence";
        this.userCache = userCache;
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    /**
     * Get a presence via user id
     * @param id id of a discord user
     * @returns Returns a new PresenceCache with bound data or null if nothing was found
     */
    async get(id) {
        var _a;
        if (this.boundObject) {
            return this;
        }
        const presence = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id)));
        if (presence) {
            return new PresenceCache(this.storageEngine, this.userCache.bindUserId(id), this.rain, presence);
        }
        else {
            return null;
        }
    }
    /**
     * Upsert the presence of a user.
     *
     * **This function automatically removes the guild_id, roles and user of a presence update before saving it**
     * @param id id of the user the presence belongs to
     * @param data updated presence data of the user
     * @returns returns a bound presence cache
     */
    async update(id, data) {
        var _a;
        if (this.boundObject) {
            this.bindObject(data);
        }
        if (data.guild_id) {
            delete data.guild_id;
        }
        if (data.roles) {
            delete data.roles;
        }
        if (data.user) {
            await this.userCache.update(data.user.id, data.user);
            delete data.user;
        }
        await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.upsert(this.buildId(id), this.structurize(data)));
        if (this.boundObject)
            return this;
        return new PresenceCache(this.storageEngine, this.userCache, this.rain, data);
    }
    /**
     * Remove a stored presence from the cache
     * @param id id of the user the presence belongs to
     */
    async remove(id) {
        var _a, _b;
        const presence = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id)));
        if (presence) {
            return (_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.remove(this.buildId(id));
        }
        else {
            return undefined;
        }
    }
}
module.exports = PresenceCache;
