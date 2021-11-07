import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
/**
 * Cache responsible for guilds
 */
declare class GuildCache extends BaseCache<import("discord-typings").GuildData> {
    channelCache: import("./ChannelCache");
    roleCache: import("./RoleCache");
    memberCache: import("./MemberCache");
    emojiCache: import("./EmojiCache");
    presenceCache: import("./PresenceCache");
    guildChannelMap: import("./ChannelMapCache");
    namespace: "guild";
    /**
     * Create a new GuildCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param storageEngine Storage engine to use for this cache
     * @param channelCache Instantiated ChannelCache class
     * @param roleCache Instantiated RoleCache class
     * @param memberCache Instantiated MemberCache class
     * @param emojiCache Instantiated EmojiCache class
     * @param presenceCache Instantiated PresenceCache class
     * @param guildToChannelCache Instantiated ChannelMap class
     * @param boundObject Optional, may be used to bind a guild object to the cache
     */
    constructor(storageEngine: BaseStorageEngine<import("discord-typings").GuildData>, channelCache: import("./ChannelCache"), roleCache: import("./RoleCache"), memberCache: import("./MemberCache"), emojiCache: import("./EmojiCache"), presenceCache: import("./PresenceCache"), guildToChannelCache: import("./ChannelMapCache"), rain: import("../RainCache")<any, any>, boundObject?: import("discord-typings").GuildData);
    /**
     * Retrieves a guild via id
     * @param id Discord id of the guild
     * @returns Returns either a Guild Object or null if the guild does not exist.
     */
    get(id: string): Promise<GuildCache | null>;
    /**
     * Upsert a guild object
     * @param id id of the guild
     * @param data data received from the event
     * @param data.channels Array of channels
     * @param data.members Array of members
     * @param data.presences Array of presences
     * @param data.roles Array of roles
     * @param data.emojis Array of emojis
     * @returns returns a bound guild cache
     */
    update(id: string, data: Partial<import("discord-typings").GuildData>): Promise<GuildCache>;
    /**
     * Removes a guild and associated elements from the cache.
     * @param id id of the guild to remove
     */
    remove(id: string): Promise<void>;
    /**
     * Filter through the collection of guilds
     * @param fn Filter function
     * @returns array of bound guild caches
     */
    filter(fn: (emoji?: import("discord-typings").GuildData, index?: number, array?: Array<import("discord-typings").GuildData>) => unknown): Promise<Array<GuildCache>>;
    /**
     * Filter through the collection of guilds and return the first match
     * @param fn Filter function
     * @returns returns a bound guild cache
     */
    find(fn: (emoji?: import("discord-typings").GuildData, index?: number, array?: Array<string>) => unknown): Promise<GuildCache | null>;
    /**
     * Add a guild to the guild index
     * @param id ids of the guilds
     */
    addToIndex(id: string): Promise<void>;
    /**
     * Remove a guild from the guild index
     * @param id id of the guild
     */
    removeFromIndex(id: string): Promise<void>;
    /**
     * Check if a guild is indexed alias cached
     * @param id - id of the guild
     * @returns True if this guild is cached and false if not
     */
    isIndexed(id: string): Promise<boolean>;
    /**
     * Get all guild ids currently indexed
     * @returns array of guild ids
     */
    getIndexMembers(): Promise<Array<string>>;
    /**
     * Remove the guild index, you should probably not call this at all :<
     */
    removeIndex(): Promise<void>;
    /**
     * Get the number of guilds that are currently cached
     * @returns Number of guilds currently cached
     */
    getIndexCount(): Promise<number>;
}
export = GuildCache;
