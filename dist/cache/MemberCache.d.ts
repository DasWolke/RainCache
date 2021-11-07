import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
/**
 * Cache responsible for storing guild members
 */
declare class MemberCache extends BaseCache<import("discord-typings").MemberData> {
    namespace: "member";
    userCache: import("./UserCache");
    /**
     * Creates a new MemberCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param storageEngine storage engine to use
     * @param userCache user cache instance
     * @param boundObject Bind an object to this instance
     */
    constructor(storageEngine: BaseStorageEngine<import("discord-typings").MemberData>, userCache: import("./UserCache"), rain: import("../RainCache")<any, any>, boundObject?: import("discord-typings").MemberData);
    /**
     * Get a member via id
     * @param id id of the member
     * @param guildId id of the guild of the member, defaults to the bound guild of the cache
     * @returns bound member cache with properties of the member or null if no member is cached
     */
    get(id: string, guildId?: string | undefined): Promise<MemberCache | null>;
    /**
     * Update data of a guild member
     * @param id id of the member
     * @param guildId id of the guild of the member, defaults to the bound guild of the cache
     * @param data updated guild member data
     */
    update(id: string, guildId: string | undefined, data: Partial<import("discord-typings").MemberData & import("discord-typings").UserData & {
        guild_id: string;
    }>): Promise<MemberCache>;
    /**
     * Remove a member from the cache
     * @param id id of the member
     * @param guildId id of the guild of the member, defaults to the bound guild of the cache
     */
    remove(id: string, guildId?: string | undefined): Promise<void>;
    /**
     * Filter for members by providing filter function which returns true upon success and false otherwise
     * @param fn Filter function
     * @param guildId guild id the member is in
     */
    filter(fn: (member?: import("discord-typings").MemberData, index?: number, array?: Array<import("discord-typings").MemberData>) => unknown, guildId: string | undefined, ids: Array<string>): Promise<Array<MemberCache>>;
    /**
     * Filter through the collection of members and return the first match
     * @param fn Filter function
     * @param guildId guild id the member is in
     */
    find(fn: (member?: import("discord-typings").MemberData, index?: number, array?: Array<string>) => boolean, guildId?: string | undefined, ids?: Array<string> | undefined): Promise<MemberCache | null>;
    /**
     * Build a unique key for storing member data
     * @param userId id of the user belonging to the member
     * @param guildId - id of the guild the member+
     */
    buildId(userId: string, guildId?: string): string;
}
export = MemberCache;
