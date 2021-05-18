import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
/**
 * Cache for providing a guild/user -> channels map
 */
declare class ChannelMapCache extends BaseCache<import("../types").ChannelMap> {
    namespace: "channelmap";
    /**
     * Create a new ChannelMapCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param storageEngine storage engine to use for this cache
     * @param boundObject Optional, may be used to bind the map object to the cache
     */
    constructor(storageEngine: BaseStorageEngine<import("../types").ChannelMap>, rain: import("../RainCache")<any, any>, boundObject?: import("../types").ChannelMap);
    /**
     * Get a ChannelMap via id of the guild or the user
     * @param id Id of the user or the guild
     * @param type Type of the map to get
     */
    get(id: string, type?: "guild" | "user"): Promise<ChannelMapCache | null>;
    /**
     * Upsert a ChannelMap
     * @param id Id of the user or the guild
     * @param data Array of channel ids
     * @param type Type of the map to upsert
     * @param remove Remove old channels that don't exist anymore
     */
    update(id: string, data: Array<string>, type?: "guild" | "user", remove?: boolean): Promise<ChannelMapCache>;
    /**
     * Remove a ChannelMap
     * @param {string} id Id of the user or the guild
     * @param {string} [type=guild] Type of the map to remove
     * @returns {Promise<null>}
     */
    remove(id: string, type?: "guild" | "user"): Promise<void>;
    /**
     * Remove old channels from the array of mapped channels
     * @param oldChannels Array of old channels
     * @param removeChannels Array of new channels
     * @returns Array of filtered channels
     */
    private _removeOldChannels;
    /**
     * Checks for duplicate ids in the provided arrays
     * @param oldIds Array of old ids
     * @param newIds Array of new ids
     * @returns Array of non duplicated Ids
     */
    private _checkDupes;
    /**
     * Build a unique key id for the channel map
     * @param id Id of the guild/user
     * @param type Type of the map
     */
    private _buildMapId;
    /**
     * Build a map object which is bound to the channelMapCache object
     * @param id Id of the guild/user
     * @param channels Array of channel ids
     * @param type - type of the map
     */
    private _buildMap;
}
export = ChannelMapCache;
