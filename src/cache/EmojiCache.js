const BaseCache = require("./BaseCache");

/**
 * Cache responsible for storing emoji related data
 */
class EmojiCache extends BaseCache {
	/**
	 * Create a new EmojiCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param {import("../storageEngine/BaseStorageEngine")} storageEngine - storage engine to use for this cache
	 * @param {Emoji} [boundObject] - Optional, may be used to bind an emoji object to the cache
	 */
	constructor(storageEngine, boundObject) {
		super();
		this.namespace = "emoji";
		this.storageEngine = storageEngine;
		if (boundObject) {
			this.bindObject(boundObject);
		}
	}

	/**
	 * Get an emoji via id
	 * @param {string} id - id of the emoji (this does not refer to the name of the emoji)
	 * @param {string} guildId - id of the guild this emoji belongs to
	 * @return {Promise<?EmojiCache>} EmojiCache with bound object or null if nothing was found
	 */
	async get(id, guildId = this.boundGuild) {
		if (this.boundObject) {
			return this.boundObject;
		}
		const emoji = await this.storageEngine.get(this.buildId(id, guildId));
		if (emoji) {
			return new EmojiCache(this.storageEngine, emoji);
		} else {
			return null;
		}
	}

	/**
	 * Update a emoji
	 * @param {string} id - id of the emoji (this does not refer to the name of the emoji)
	 * @param {string} guildId - id of the guild this emoji belongs to
	 * @param {Emoji} data - new data of the emoji, that will get merged with the old data
	 * @return {Promise<EmojiCache>} - returns a bound EmojiCache
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
	 * @param {string} id - id of the emoji (this does not refer to the name of the emoji)
	 * @param {string} guildId - id of the guild this emoji belongs to
	 * @return {Promise<void>}
	 */
	async remove(id, guildId = this.boundGuild) {
		if (this.boundObject) {
			return this.remove(this.boundObject.id, guildId);
		}
		const emoji = await this.storageEngine.get(this.buildId(id, guildId));
		if (emoji) {
			await this.removeFromIndex(id, guildId);
			return this.storageEngine.remove(this.buildId(id, guildId));
		} else {
			return null;
		}
	}

	/**
	 * Filter for emojis by providing a filter function which returns true upon success and false otherwise
	 * @param {(emoji: import("@amanda/discordtypings").EmojiData) => boolean} fn - filter function to use for the filtering
	 * @param {string} guildId - id of the guild the emojis searched belong to
	 * @param ids
	 * @return {Promise<Array<EmojiCache>>} - array of bound emoji caches
	 */
	async filter(fn, guildId = this.boundGuild, ids = null) {
		const emojis = await this.storageEngine.filter(fn, ids, super.buildId(guildId));
		return emojis.map(e => new EmojiCache(this.storageEngine, e));
	}

	/**
	 * Find an emoji by providing a filter function which returns true upon success and false otherwise
	 * @param {(emoji: import("@amanda/discordtypings").EmojiData) => boolean} fn - filter function to use for filtering for a single emoji
	 * @param guildId
	 * @param ids
	 * @return {Promise<EmojiCache>} - bound emoji cache
	 */
	async find(fn, guildId = this.boundGuild, ids = null) {
		const emoji = await this.storageEngine.find(fn, ids, super.buildId(guildId));
		return new EmojiCache(this.storageEngine, emoji);
	}

	/**
	 * Build a unique key to store the emoji in the datasource
	 * @param {string} emojiId - id of the emoji (this does not refer to the name of the emoji)
	 * @param {string} guildId - id of the guild this emoji belongs to
	 * @return {string} - prepared key
	 */
	// @ts-ignore
	buildId(emojiId, guildId) {
		if (!guildId) {
			return super.buildId(emojiId);
		}
		return `${this.namespace}.${guildId}.${emojiId}`;
	}
}

/**
 * @typedef {Object} Emoji - A discord emoji structure
 * @property {string} id - id of the emoji
 * @property {string} name - name of the emoji
 * @property {Array} [roles] - array of roles whitelisted to use the emoji (whitelisted apps only)
 * @property {import("@amanda/discordtypings").UserData} [user] - User that created this emoji
 * @property {boolean} require_colons - whether this emoji must be wrapped in colons
 * @property {boolean} managed - whether this emoji is managed
 */

module.exports = EmojiCache;
