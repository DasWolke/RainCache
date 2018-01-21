'use strict';
const BaseCache = require('./BaseCache');

/**
 * Cache responsible for storing emoji related data
 * @property {StorageEngine} storageEngine - storage engine to use for this cache
 * @property {String} namespace=emoji - namespace of the cache
 * @extends BaseCache
 */
class EmojiCache extends BaseCache {
    /**
     * Create a new EmojiCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param {StorageEngine} storageEngine - storage engine to use for this cache
     * @param {Emoji} [boundObject] - Optional, may be used to bind an emoji object to the cache
     */
    constructor(storageEngine, boundObject) {
        super();
        this.namespace = 'emoji';
        this.storageEngine = storageEngine;
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    /**
     * Get an emoji via id
     * @param {String} id - id of the emoji (this does not refer to the name of the emoji)
     * @param {String} guildId - id of the guild this emoji belongs to
     * @return {Promise.<EmojiCache|null>} EmojiCache with bound object or null if nothing was found
     */
    async get(id, guildId = this.boundGuild) {
        if (this.boundObject) {
            return this.boundObject;
        }
        let emoji = await this.storageEngine.get(this.buildId(id, guildId));
        if (emoji) {
            return new EmojiCache(this.storageEngine, emoji);
        } else {
            return null;
        }
    }

    /**
     * Update a emoji
     * @param {String} id - id of the emoji (this does not refer to the name of the emoji)
     * @param {String} guildId - id of the guild this emoji belongs to
     * @param {Emoji} data - new data of the emoji, that will get merged with the old data
     * @return {Promise.<EmojiCache>} - returns a bound EmojiCache
     */
    async update(id, guildId = this.boundGuild, data) {
        if (this.boundObject) {
            this.bindObject(data);
            await this.update(id, guildId, data);
            return this;
        }
        await this.addToIndex(id, guildId);
        await this.storageEngine.upsert(this.buildId(id, guildId), data);
        return new EmojiCache(this.storageEngine, data);
    }

    /**
     * Remove an emoji from the cache
     * @param {String} id - id of the emoji (this does not refer to the name of the emoji)
     * @param {String} guildId - id of the guild this emoji belongs to
     * @return {Promise.<void>}
     */
    async remove(id, guildId = this.boundGuild) {
        if (this.boundObject) {
            return this.remove(this.boundObject.id, guildId);
        }
        let emoji = await this.storageEngine.get(this.buildId(id, guildId));
        if (emoji) {
            await this.removeFromIndex(id, guildId);
            return this.storageEngine.remove(this.buildId(id, guildId));
        } else {
            return null;
        }
    }

    /**
     * Filter for emojis by providing a filter function which returns true upon success and false otherwise
     * @param {Function} fn - filter function to use for the filtering
     * @param {String} guildId - id of the guild the emojis searched belong to
     * @param ids
     * @return {Promise.<EmojiCache[]>} - array of bound emoji caches
     */
    async filter(fn, guildId = this.boundGuild, ids = null) {
        let emojis = await this.storageEngine.filter(fn, ids, super.buildId(guildId));
        return emojis.map(e => new EmojiCache(this.storageEngine, e));
    }

    /**
     * Find an emoji by providing a filter function which returns true upon success and false otherwise
     * @param {Function} fn - filter function to use for filtering for a single emoji
     * @param guildId
     * @param ids
     * @return {Promise.<EmojiCache>} - bound emoji cache
     */
    async find(fn, guildId = this.boundGuild, ids = null) {
        let emoji = await this.storageEngine.find(fn, ids, super.buildId(guildId));
        return new EmojiCache(this.storageEngine, emoji);
    }

    /**
     * Build a unique key to store the emoji in the datasource
     * @param {String} emojiId - id of the emoji (this does not refer to the name of the emoji)
     * @param {String} guildId - id of the guild this emoji belongs to
     * @return {String} - prepared key
     */
    buildId(emojiId, guildId) {
        if (!guildId) {
            return super.buildId(emojiId);
        }
        return `${this.namespace}.${guildId}.${emojiId}`;
    }
}

/**
 * @typedef {Object} Emoji - A discord emoji structure
 * @property {String} id - id of the emoji
 * @property {String} name - name of the emoji
 * @property {Array} [roles] - array of roles whitelisted to use the emoji (whitelisted apps only)
 * @property {User} [user] - User that created this emoji
 * @property {Boolean} require_colons - whether this emoji must be wrapped in colons
 * @property {Boolean} managed - whether this emoji is managed
 */

module.exports = EmojiCache;
