"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
/**
 * Cache responsible for storing role related data
 */
class RoleCache extends BaseCache_1.default {
    /**
     * Create a new RoleCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param storageEngine Storage engine to use for this cache
     * @param boundObject Optional, may be used to bind a role object to the cache
     */
    constructor(storageEngine, rain, boundObject) {
        super(rain);
        this.storageEngine = storageEngine;
        this.namespace = "role";
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    /**
     * Get a role via id and guild id of the role
     * @param id id of the role
     * @param guildId id of the guild belonging to the role
     * @returns Returns a Role Cache with a bound role or null if no role was found
     */
    async get(id, guildId) {
        var _a;
        if (this.boundObject) {
            return this;
        }
        const role = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id, guildId)));
        if (!role) {
            return null;
        }
        return new RoleCache(this.storageEngine, this.rain, role);
    }
    /**
     * Update a role
     * @param id - id of the role
     * @param guildId - id of the guild belonging to the role
     * @param data - new role data
     * @returns returns a bound RoleCache once the data was updated.
     */
    async update(id, guildId, data) {
        var _a;
        if (this.boundObject) {
            this.bindObject(data);
        }
        if (!guildId) {
            return Promise.reject("Missing guild id");
        }
        // @ts-ignore
        if (!data.guild_id) {
            // @ts-ignore
            data.guild_id = guildId;
        }
        if (!data.id) {
            data.id = id;
        }
        await this.addToIndex(id, guildId);
        await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.upsert(this.buildId(id, guildId), this.structurize(data)));
        if (this.boundObject)
            return this;
        return new RoleCache(this.storageEngine, this.rain, data);
    }
    /**
     * Remove a role from the cache
     * @param id id of the role
     * @param guildId id of the guild belonging to the role
     */
    async remove(id, guildId) {
        var _a, _b;
        const role = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id, guildId)));
        if (role) {
            await this.removeFromIndex(id, guildId);
            return (_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.remove(this.buildId(id, guildId));
        }
        else {
            return undefined;
        }
    }
    /**
     * Filter for roles by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for the filtering
     * @param guildId id of the guild belonging to the roles
     * @param ids array of role ids that should be used for the filtering
     * @returns array of bound role caches
     */
    async filter(fn, guildId = this.boundGuild, ids = undefined) {
        var _a;
        const roles = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.filter(fn, ids, super.buildId(guildId)));
        if (!roles)
            return [];
        return roles.map(r => new RoleCache(this.storageEngine, this.rain, r));
    }
    /**
     * Find a role by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for filtering for a single role
     * @param guildId id of the guild belonging to the roles
     * @param ids array of role ids that should be used for the filtering
     * @returns bound role cache
     */
    async find(fn, guildId = this.boundGuild, ids = undefined) {
        var _a;
        const role = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.find(fn, ids, super.buildId(guildId)));
        if (!role)
            return null;
        return new RoleCache(this.storageEngine, this.rain, role);
    }
    /**
     * Build a unique key for the role cache entry
     * @param roleId id of the role
     * @param guildId id of the guild belonging to the role
     * @returns the prepared key
     */
    buildId(roleId, guildId) {
        if (!guildId) {
            return super.buildId(roleId);
        }
        return `${this.namespace}.${guildId}.${roleId}`;
    }
}
module.exports = RoleCache;
