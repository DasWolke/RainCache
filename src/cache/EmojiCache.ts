import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";

/**
 * Cache responsible for storing emoji related data
 */
class EmojiCache extends BaseCache<import("@amanda/discordtypings").EmojiData> {
	public namespace: "emoji"

	/**
	 * Create a new EmojiCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param storageEngine storage engine to use for this cache
	 * @param boundObject Optional, may be used to bind an emoji object to the cache
	 */
	public constructor(storageEngine: BaseStorageEngine<import("@amanda/discordtypings").EmojiData>, boundObject?: import("@amanda/discordtypings").EmojiData) {
		super();
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
	public async get(id: string, guildId: string | undefined = this.boundGuild): Promise<EmojiCache | null> {
		if (this.boundObject) {
			return this;
		}
		const emoji = await this.storageEngine?.get(this.buildId(id, guildId));
		if (emoji) {
			return new EmojiCache(this.storageEngine as BaseStorageEngine<import("@amanda/discordtypings").EmojiData>, emoji);
		} else {
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
	public async update(id: string, guildId: string | undefined = this.boundGuild, data: import("@amanda/discordtypings").EmojiData): Promise<EmojiCache> {
		if (this.boundObject) {
			this.bindObject(data);
		}
		await this.addToIndex([id], guildId);
		await this.storageEngine?.upsert(this.buildId(id, guildId), data);
		if (this.boundObject) return this;
		return new EmojiCache(this.storageEngine as BaseStorageEngine<import("@amanda/discordtypings").EmojiData>, data);
	}

	/**
	 * Remove an emoji from the cache
	 * @param id id of the emoji (this does not refer to the name of the emoji)
	 * @param guildId id of the guild this emoji belongs to
	 */
	public async remove(id: string, guildId: string | undefined = this.boundGuild): Promise<void> {
		const emoji = await this.storageEngine?.get(this.buildId(id, guildId));
		if (emoji) {
			await this.removeFromIndex(id, guildId);
			return this.storageEngine?.remove(this.buildId(id, guildId));
		} else {
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
	public async filter(fn: (emoji?: import("@amanda/discordtypings").EmojiData, index?: number, array?: Array<import("@amanda/discordtypings").EmojiData>) => unknown, guildId: string | undefined, ids?: Array<string> | undefined): Promise<Array<EmojiCache>> {
		if (!guildId && this.boundGuild) guildId = this.boundGuild;
		const emojis = await this.storageEngine?.filter(fn, ids, super.buildId(guildId as string));
		if (!emojis) return [];
		return emojis.map(e => new EmojiCache(this.storageEngine as BaseStorageEngine<import("@amanda/discordtypings").EmojiData>, e));
	}

	/**
	 * Find an emoji by providing a filter function which returns true upon success and false otherwise
	 * @param fn filter function to use for filtering for a single emoji
	 * @param guildId id of the guild the emojis searched belong to
	 * @param ids
	 * @returns bound emoji cache
	 */
	public async find(fn: (emoji?: import("@amanda/discordtypings").EmojiData, index?: number, array?: Array<string>) => unknown, guildId: string, ids: Array<string> | undefined): Promise<EmojiCache | null> {
		if (!guildId && this.boundGuild) guildId = this.boundGuild;
		const emoji = await this.storageEngine?.find(fn, ids, super.buildId(guildId));
		if (!emoji) return null;
		return new EmojiCache(this.storageEngine as BaseStorageEngine<import("@amanda/discordtypings").EmojiData>, emoji);
	}

	/**
	 * Build a unique key to store the emoji in the datasource
	 * @param emojiId id of the emoji (this does not refer to the name of the emoji)
	 * @param guildId id of the guild this emoji belongs to
	 * @returns prepared key
	 */
	public buildId(emojiId: string, guildId?: string): string {
		if (!guildId) {
			return super.buildId(emojiId);
		}
		return `${this.namespace}.${guildId}.${emojiId}`;
	}
}

export = EmojiCache;
