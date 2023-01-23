import BaseCache from "./BaseCache";

/**
 * Cache responsible for storing emoji related data
 */
class EmojiCache extends BaseCache<import("discord-typings").Emoji> {
	public namespace = "emoji" as const;

	/**
	 * Get an emoji via id
	 * @param id id of the emoji (this does not refer to the name of the emoji)
	 * @param guildId id of the guild this emoji belongs to
	 * @returns EmojiCache with bound object or null if nothing was found
	 */
	public async get(id: string, guildId: string | undefined = this.boundGuild): Promise<EmojiCache | null> {
		if (this.boundObject) return this;
		const emoji = await this.storageEngine.get(this.buildId(id, guildId));
		if (!emoji) return null;
		return new EmojiCache(this.storageEngine, this.rain).bindObject(emoji);
	}

	/**
	 * Update a emoji
	 * @param id id of the emoji (this does not refer to the name of the emoji)
	 * @param guildId id of the guild this emoji belongs to
	 * @param data new data of the emoji, that will get merged with the old data
	 * @returns returns a bound EmojiCache
	 */
	public async update(id: string, guildId: string | undefined = this.boundGuild, data: Partial<import("discord-typings").Emoji>): Promise<EmojiCache> {
		if (this.rain.options.disabledCaches.emoji) return this;
		if (this.boundObject) this.bindObject(data);
		await this.addToIndex([id], guildId);
		const old = await this.storageEngine.upsert(this.buildId(id, guildId), this.structurize(data));
		if (this.boundObject) return this;
		return new EmojiCache(this.storageEngine, this.rain).bindObject(data, old);
	}

	/**
	 * Remove an emoji from the cache
	 * @param id id of the emoji (this does not refer to the name of the emoji)
	 * @param guildId id of the guild this emoji belongs to
	 */
	public async remove(id: string, guildId: string | undefined = this.boundGuild): Promise<void> {
		await this.removeFromIndex(id, guildId);
		await this.storageEngine.remove(this.buildId(id, guildId));
	}

	/**
	 * Filter for emojis by providing a filter function which returns true upon success and false otherwise
	 * @param fn filter function to use for the filtering
	 * @param guildId id of the guild the emojis searched belong to
	 * @param ids
	 * @returns array of bound emoji caches
	 */
	public async filter(fn: (emoji: import("discord-typings").Emoji, index: number) => boolean, guildId: string | undefined, ids?: Array<string>): Promise<Array<EmojiCache>> {
		if (!guildId && this.boundGuild) guildId = this.boundGuild;
		const emojis = await this.storageEngine.filter(fn, ids || null, super.buildId(guildId as string));
		return emojis.map(e => new EmojiCache(this.storageEngine, this.rain).bindObject(e));
	}

	/**
	 * Find an emoji by providing a filter function which returns true upon success and false otherwise
	 * @param fn filter function to use for filtering for a single emoji
	 * @param guildId id of the guild the emojis searched belong to
	 * @param ids
	 * @returns bound emoji cache
	 */
	public async find(fn: (emoji: import("discord-typings").Emoji, index: number) => boolean, guildId: string, ids: Array<string> | undefined): Promise<EmojiCache | null> {
		if (!guildId && this.boundGuild) guildId = this.boundGuild;
		const emoji = await this.storageEngine.find(fn, ids || null, super.buildId(guildId));
		if (!emoji) return null;
		return new EmojiCache(this.storageEngine, this.rain).bindObject(emoji);
	}

	/**
	 * Build a unique key to store the emoji in the datasource
	 * @param emojiId id of the emoji (this does not refer to the name of the emoji)
	 * @param guildId id of the guild this emoji belongs to
	 * @returns prepared key
	 */
	public buildId(emojiId: string, guildId?: string): string {
		if (!guildId) return super.buildId(emojiId);
		return `${this.namespace}.${guildId}.${emojiId}`;
	}
}

export default EmojiCache;
