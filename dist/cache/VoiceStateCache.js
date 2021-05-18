"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
/**
 * Cache responsible for caching users
 */
class VoiceStateCache extends BaseCache_1.default {
    /**
     * Create a new VoiceStateCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param storageEngine Storage engine to use for this cache
     * @param boundObject Optional, may be used to bind a user object to the cache
     */
    constructor(storageEngine, rain, boundObject) {
        super(rain);
        this.storageEngine = storageEngine;
        this.namespace = "voicestates";
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    /**
     * Loads a VoiceState from the cache via id
     * @param id discord id of the user
     * @param guildId guild id
     * @returns Returns a VoiceState Cache with a bound user or null if no user was found
     */
    async get(id = (_a = this.boundObject) === null || _a === void 0 ? void 0 : _a.user_id, guildId) {
        var _a, _b;
        if (this.boundObject) {
            return this;
        }
        const state = await ((_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.get(this.buildId(id, guildId)));
        if (!state)
            return null;
        return new VoiceStateCache(this.storageEngine, this.rain, state);
    }
    /**
     * Update a VoiceState entry in the cache
     * @param id discord id of the user
     * @param guildId guild id
     * @param data updated data of the VoiceState, it will be merged with the old data
     */
    async update(id, guildId, data) {
        var _a;
        if (this.boundObject) {
            this.bindObject(data);
        }
        delete data.member;
        if (!data.guild_id)
            data.guild_id = guildId;
        await this.addToIndex(id);
        await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.upsert(this.buildId(id, guildId), this.structurize(data)));
        if (this.boundObject)
            return this;
        return new VoiceStateCache(this.storageEngine, this.rain, data);
    }
    /**
     * Remove a VoiceState from the cache
     * @param id discord id of the user
     * @param guildId guild id
     */
    async remove(id = (_a = this.boundObject) === null || _a === void 0 ? void 0 : _a.user_id, guildId) {
        var _a, _b;
        const state = await this.get(id, guildId);
        if (state) {
            await this.removeFromIndex(id, guildId);
            return (_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.remove(this.buildId(id, guildId));
        }
        else {
            return undefined;
        }
    }
    /**
     * Filter for VoiceStates by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for the filtering
     * @param ids Array of user ids, if omitted the global user index will be used
     */
    async filter(fn, ids = undefined) {
        var _a;
        const states = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.filter(fn, ids, this.namespace));
        if (!states)
            return [];
        return states.map(s => new VoiceStateCache(this.storageEngine, this.rain, s));
    }
    /**
     * Find a VoiceState by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for filtering for a state
     * @param ids List of ids that should be used as the scope of the filter
     * @returns Returns a VoiceState Cache with a bound state or null if no state was found
     */
    async find(fn, ids = undefined) {
        var _a;
        const state = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.find(fn, ids, this.namespace));
        if (!state)
            return null;
        return new VoiceStateCache(this.storageEngine, this.rain, state);
    }
    /**
     * Bind a user id to the cache
     * @param userId id of the user
     * @returns Returns a VoiceStateCache that has an id bound to it, which serves as the default argument to get, update and delete
     */
    bindUserId(userId) {
        // @ts-ignore
        this.user_id = userId;
        return this;
    }
    /**
     * Add a voice state to the voicestates index
     * @param id id of the voice state
     */
    async addToIndex(id) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.addToList(this.namespace, id);
    }
    /**
     * Remove a VoiceState from the index
     * @param id id of the user
     */
    async removeFromIndex(id, guildId) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.removeFromList(this.namespace, this.buildId(id, guildId));
    }
    /**
     * Check if a VoiceState is indexed
     * @param id id of the user
     * @return True if the state is indexed, false otherwise
     */
    async isIndexed(id, guildId) {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.isListMember(this.namespace, this.buildId(id, guildId))) || false;
    }
    /**
     * Get a list of currently indexed VoiceStates, since VoiceStates is a global namespace,
     * this will return **ALL** VoiceStates that the bot cached currently
     * @returns Array with a list of ids of users that are indexed
     */
    async getIndexMembers() {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.getListMembers(this.namespace)) || [];
    }
    /**
     * Delete the VoiceState index, you should probably **not** use this function, but I won't stop you.
     */
    async removeIndex() {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.removeList(this.namespace);
    }
    /**
     * Get the number of VoiceStates that are currently cached
     * @returns Number of VoiceStates currently cached
     */
    async getIndexCount() {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.getListCount(this.namespace)) || 0;
    }
    /**
     * Build a unique key for storing VoiceState data
     * @param userId id of the user
     * @param guildId id of the guild
     */
    buildId(userId, guildId) {
        if (!guildId) {
            return super.buildId(userId);
        }
        return `${this.namespace}.${guildId}.${userId}`;
    }
}
module.exports = VoiceStateCache;
