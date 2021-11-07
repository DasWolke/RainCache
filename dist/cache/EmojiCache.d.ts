import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
/**
 * Cache responsible for storing emoji related data
 */
declare class EmojiCache extends BaseCache<import("discord-typings").EmojiData> {
    namespace: "emoji";
    /**
     * Create a new EmojiCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param storageEngine storage engine to use for this cache
     * @param boundObject Optional, may be used to bind an emoji object to the cache
     */
    constructor(storageEngine: BaseStorageEngine<import("discord-typings").EmojiData>, rain: import("../RainCache")<any, any>, boundObject?: import("discord-typings").EmojiData);
    /**
     * Get an emoji via id
     * @param id id of the emoji (this does not refer to the name of the emoji)
     * @param guildId id of the guild this emoji belongs to
     * @returns EmojiCache with bound object or null if nothing was found
     */
    get(id: string, guildId?: string | undefined): Promise<EmojiCache | null>;
    /**
     * Update a emoji
     * @param id id of the emoji (this does not refer to the name of the emoji)
     * @param guildId id of the guild this emoji belongs to
     * @param data new data of the emoji, that will get merged with the old data
     * @returns returns a bound EmojiCache
     */
    update(id: string, guildId: string | undefined, data: import("discord-typings").EmojiData): Promise<EmojiCache>;
    /**
     * Remove an emoji from the cache
     * @param id id of the emoji (this does not refer to the name of the emoji)
     * @param guildId id of the guild this emoji belongs to
     */
    remove(id: string, guildId?: string | undefined): Promise<void>;
    /**
     * Filter for emojis by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for the filtering
     * @param guildId id of the guild the emojis searched belong to
     * @param ids
     * @returns array of bound emoji caches
     */
    filter(fn: (emoji?: import("discord-typings").EmojiData, index?: number, array?: Array<import("discord-typings").EmojiData>) => unknown, guildId: string | undefined, ids?: Array<string> | undefined): Promise<Array<EmojiCache>>;
    /**
     * Find an emoji by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for filtering for a single emoji
     * @param guildId id of the guild the emojis searched belong to
     * @param ids
     * @returns bound emoji cache
     */
    find(fn: (emoji?: import("discord-typings").EmojiData, index?: number, array?: Array<string>) => unknown, guildId: string, ids: Array<string> | undefined): Promise<EmojiCache | null>;
    /**
     * Build a unique key to store the emoji in the datasource
     * @param emojiId id of the emoji (this does not refer to the name of the emoji)
     * @param guildId id of the guild this emoji belongs to
     * @returns prepared key
     */
    buildId(emojiId: string, guildId?: string): string;
}
export = EmojiCache;
