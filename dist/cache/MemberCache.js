"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
/**
 * Cache responsible for storing guild members
 */
class MemberCache extends BaseCache_1.default {
    /**
     * Creates a new MemberCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param storageEngine storage engine to use
     * @param userCache user cache instance
     * @param boundObject Bind an object to this instance
     */
    constructor(storageEngine, userCache, rain, boundObject) {
        super(rain);
        this.storageEngine = storageEngine;
        this.namespace = "member";
        this.user = userCache;
        this.boundGuild = "";
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    /**
     * Get a member via id
     * @param id id of the member
     * @param guildId id of the guild of the member, defaults to the bound guild of the cache
     * @returns bound member cache with properties of the member or null if no member is cached
     */
    async get(id, guildId = this.boundGuild) {
        var _a;
        if (this.boundObject) {
            return this;
        }
        const member = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id, guildId)));
        if (!member) {
            return null;
        }
        // @ts-ignore
        return new MemberCache(this.storageEngine, this.user.bindUserId(member.id), this.rain, member);
    }
    /**
     * Update data of a guild member
     * @param id id of the member
     * @param guildId id of the guild of the member, defaults to the bound guild of the cache
     * @param data updated guild member data
     */
    async update(id, guildId = this.boundGuild, data) {
        var _a;
        if (this.boundObject) {
            this.bindObject(data);
        }
        if (!guildId) {
            throw new Error(`Empty guild id for member ${id}`);
        }
        // @ts-ignore
        if (!data.guild_id) {
            // @ts-ignore
            data.guild_id = guildId;
        }
        // @ts-ignore
        if (!data.id) {
            // @ts-ignore
            data.id = id;
        }
        // @ts-ignore
        if (data.user) {
            // @ts-ignore
            await this.user.update(data.user.id, data.user);
            // @ts-ignore
            delete data.user;
        }
        await this.addToIndex(id, guildId);
        await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.upsert(this.buildId(id, guildId), this.structurize(data)));
        if (this.boundObject)
            return this;
        // @ts-ignore
        return new MemberCache(this.storageEngine, this.user.bindUserId(data.id), this.rain, data);
    }
    /**
     * Remove a member from the cache
     * @param id id of the member
     * @param guildId id of the guild of the member, defaults to the bound guild of the cache
     */
    async remove(id, guildId = this.boundGuild) {
        var _a, _b;
        const member = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id, guildId)));
        if (member) {
            await this.removeFromIndex(id, guildId);
            return (_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.remove(this.buildId(id, guildId));
        }
        else {
            return undefined;
        }
    }
    /**
     * Filter for members by providing filter function which returns true upon success and false otherwise
     * @param fn Filter function
     * @param guildId guild id the member is in
     */
    async filter(fn, guildId = this.boundGuild, ids) {
        var _a;
        const members = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.filter(fn, ids, super.buildId(guildId)));
        // @ts-ignore
        return members.map(m => new MemberCache(this.storageEngine, this.user.bindUserId(m.id), this.rain, m).bindGuild(this.boundGuild));
    }
    /**
     * Filter through the collection of members and return the first match
     * @param fn Filter function
     * @param guildId guild id the member is in
     */
    async find(fn, guildId = this.boundGuild, ids = undefined) {
        var _a;
        const member = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.find(fn, ids, super.buildId(guildId)));
        if (!member)
            return null;
        // @ts-ignore
        return new MemberCache(this.storageEngine, this.user.bindUserId(member.id), this.rain, member);
    }
    /**
     * Build a unique key for storing member data
     * @param userId id of the user belonging to the member
     * @param guildId - id of the guild the member+
     */
    buildId(userId, guildId) {
        if (!guildId) {
            return super.buildId(userId);
        }
        return `${this.namespace}.${guildId}.${userId}`;
    }
}
module.exports = MemberCache;
