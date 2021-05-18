"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
/**
 * Cache responsible for storing emoji related data
 */
class EmojiCache extends BaseCache_1.default {
    /**
     * Create a new EmojiCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param storageEngine storage engine to use for this cache
     * @param boundObject Optional, may be used to bind an emoji object to the cache
     */
    constructor(storageEngine, rain, boundObject) {
        super(rain);
        this.namespace = "emoji";
        this.storageEngine = storageEngine;
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    /**
     * Get an emoji via id
     * @param id id of the emoji (this does not refer to the name of the emoji)
     * @param guildId id of the guild this emoji belongs to
     * @returns EmojiCache with bound object or null if nothing was found
     */
    async get(id, guildId = this.boundGuild) {
        var _a;
        if (this.boundObject) {
            return this;
        }
        const emoji = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id, guildId)));
        if (emoji) {
            return new EmojiCache(this.storageEngine, this.rain, emoji);
        }
        else {
            return null;
        }
    }
    /**
     * Update a emoji
     * @param id id of the emoji (this does not refer to the name of the emoji)
     * @param guildId id of the guild this emoji belongs to
     * @param data new data of the emoji, that will get merged with the old data
     * @returns returns a bound EmojiCache
     */
    async update(id, guildId = this.boundGuild, data) {
        var _a;
        if (this.boundObject) {
            this.bindObject(data);
        }
        await this.addToIndex(id, guildId);
        await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.upsert(this.buildId(id, guildId), this.structurize(data)));
        if (this.boundObject)
            return this;
        return new EmojiCache(this.storageEngine, this.rain, data);
    }
    /**
     * Remove an emoji from the cache
     * @param id id of the emoji (this does not refer to the name of the emoji)
     * @param guildId id of the guild this emoji belongs to
     */
    async remove(id, guildId = this.boundGuild) {
        var _a, _b;
        const emoji = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id, guildId)));
        if (emoji) {
            await this.removeFromIndex(id, guildId);
            return (_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.remove(this.buildId(id, guildId));
        }
        else {
            return undefined;
        }
    }
    /**
     * Filter for emojis by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for the filtering
     * @param guildId id of the guild the emojis searched belong to
     * @param ids
     * @returns array of bound emoji caches
     */
    async filter(fn, guildId, ids) {
        var _a;
        if (!guildId && this.boundGuild)
            guildId = this.boundGuild;
        const emojis = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.filter(fn, ids, super.buildId(guildId)));
        if (!emojis)
            return [];
        return emojis.map(e => new EmojiCache(this.storageEngine, this.rain, e));
    }
    /**
     * Find an emoji by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for filtering for a single emoji
     * @param guildId id of the guild the emojis searched belong to
     * @param ids
     * @returns bound emoji cache
     */
    async find(fn, guildId, ids) {
        var _a;
        if (!guildId && this.boundGuild)
            guildId = this.boundGuild;
        const emoji = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.find(fn, ids, super.buildId(guildId)));
        if (!emoji)
            return null;
        return new EmojiCache(this.storageEngine, this.rain, emoji);
    }
    /**
     * Build a unique key to store the emoji in the datasource
     * @param emojiId id of the emoji (this does not refer to the name of the emoji)
     * @param guildId id of the guild this emoji belongs to
     * @returns prepared key
     */
    buildId(emojiId, guildId) {
        if (!guildId) {
            return super.buildId(emojiId);
        }
        return `${this.namespace}.${guildId}.${emojiId}`;
    }
}
module.exports = EmojiCache;
