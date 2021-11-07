import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
/**
 * Cache responsible for caching users
 */
declare class VoiceStateCache extends BaseCache<import("discord-typings").VoiceStateData> {
    /**
     * Create a new VoiceStateCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param storageEngine Storage engine to use for this cache
     * @param boundObject Optional, may be used to bind a user object to the cache
     */
    constructor(storageEngine: BaseStorageEngine<import("discord-typings").VoiceStateData>, rain: import("../RainCache")<any, any>, boundObject?: import("discord-typings").VoiceStateData);
    /**
     * Loads a VoiceState from the cache via id
     * @param id discord id of the user
     * @param guildId guild id
     * @returns Returns a VoiceState Cache with a bound user or null if no user was found
     */
    get(id: string | undefined, guildId: string): Promise<VoiceStateCache | null>;
    /**
     * Update a VoiceState entry in the cache
     * @param id discord id of the user
     * @param guildId guild id
     * @param data updated data of the VoiceState, it will be merged with the old data
     */
    update(id: string, guildId: string, data: import("discord-typings").VoiceStateData): Promise<VoiceStateCache>;
    /**
     * Remove a VoiceState from the cache
     * @param id discord id of the user
     * @param guildId guild id
     */
    remove(id: string | undefined, guildId: string): Promise<void>;
    /**
     * Filter for VoiceStates by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for the filtering
     * @param ids Array of user ids, if omitted the global user index will be used
     */
    filter(fn: (state?: import("discord-typings").VoiceStateData, index?: number, array?: Array<import("discord-typings").VoiceStateData>) => unknown, ids?: Array<string> | undefined): Promise<Array<VoiceStateCache>>;
    /**
     * Find a VoiceState by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for filtering for a state
     * @param ids List of ids that should be used as the scope of the filter
     * @returns Returns a VoiceState Cache with a bound state or null if no state was found
     */
    find(fn: (state?: import("discord-typings").VoiceStateData, index?: number, array?: Array<string>) => unknown, ids?: Array<string> | undefined): Promise<VoiceStateCache | null>;
    /**
     * Bind a user id to the cache
     * @param userId id of the user
     * @returns Returns a VoiceStateCache that has an id bound to it, which serves as the default argument to get, update and delete
     */
    bindUserId(userId: string): VoiceStateCache;
    /**
     * Add a voice state to the voicestates index
     * @param id id of the voice state
     */
    addToIndex(id: string): Promise<void>;
    /**
     * Remove a VoiceState from the index
     * @param id id of the user
     */
    removeFromIndex(id: string, guildId?: string): Promise<void>;
    /**
     * Check if a VoiceState is indexed
     * @param id id of the user
     * @return True if the state is indexed, false otherwise
     */
    isIndexed(id: string, guildId?: string): Promise<boolean>;
    /**
     * Get a list of currently indexed VoiceStates, since VoiceStates is a global namespace,
     * this will return **ALL** VoiceStates that the bot cached currently
     * @returns Array with a list of ids of users that are indexed
     */
    getIndexMembers(): Promise<Array<string>>;
    /**
     * Delete the VoiceState index, you should probably **not** use this function, but I won't stop you.
     */
    removeIndex(): Promise<void>;
    /**
     * Get the number of VoiceStates that are currently cached
     * @returns Number of VoiceStates currently cached
     */
    getIndexCount(): Promise<number>;
    /**
     * Build a unique key for storing VoiceState data
     * @param userId id of the user
     * @param guildId id of the guild
     */
    buildId(userId: string, guildId?: string): string;
}
export = VoiceStateCache;
