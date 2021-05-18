import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
/**
 * Cache responsible for storing channel related data
 */
declare class ChannelCache extends BaseCache<import("../types").Channel> {
    channelMap: import("./ChannelMapCache");
    permissionOverwrites: import("./PermissionOverwriteCache");
    recipients: import("./UserCache");
    namespace: "channel";
    /**
     * Create a new ChanneCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param storageEngine storage engine to use for this cache
     * @param channelMap Instantiated ChannelMap class
     * @param permissionOverwriteCache Instantiated PermissionOverwriteCache class
     * @param userCache Instantiated UserCache class
     * @param boundObject Optional, may be used to bind a channel object to this cache
     */
    constructor(storageEngine: BaseStorageEngine<import("../types").Channel>, channelMap: import("./ChannelMapCache"), permissionOverwriteCache: import("./PermissionOverwriteCache"), userCache: import("./UserCache"), rain: import("../RainCache")<any, any>, boundObject?: import("../types").Channel);
    /**
     * Get a channel via id
     * @param id id of the channel
     * @returns ChannelCache with bound object or null if nothing was found
     */
    get(id: string): Promise<ChannelCache | null>;
    /**
     * Upsert a channel into the cache
     * @param id id of the channel
     * @param data data to insert
     */
    update(id: string, data: import("../types").Channel): Promise<ChannelCache>;
    /**
     * Remove a channel from the cache
     * @param id id of the channel
     */
    remove(id: string): Promise<void>;
    /**
     * Filter through the collection of channels
     * @param fn Filter function
     * @param channelMap Array of ids used for the filter
     * @returns array of channel caches with bound results
     */
    filter(fn: (channel?: import("../types").Channel, index?: number, array?: Array<import("../types").Channel>) => unknown, channelMap?: Array<string>): Promise<Array<ChannelCache>>;
    /**
     * Filter through the collection of channels and return on the first result
     * @param fn Filter function
     * @param channelMap Array of ids used for the filter
     * @returns First result bound to a channel cache
     */
    find(fn: (channel?: import("@amanda/discordtypings").ChannelData) => unknown, channelMap: Array<string>): Promise<ChannelCache | null>;
    /**
     * Add channels to the channel index
     * @param id ids of the channels
     */
    addToIndex(id: string): Promise<void>;
    /**
     * Remove a channel from the index
     * @param id id of the channel
     */
    removeFromIndex(id: string): Promise<void>;
    /**
     * Check if a channel is indexed
     * @param id - id of the channel
     */
    isIndexed(id: string): Promise<boolean>;
    /**
     * Get a list of ids of indexed channels
     */
    getIndexMembers(): Promise<Array<string>>;
    /**
     * Remove the channel index, you should probably not call this at all :<
     */
    removeIndex(): Promise<void>;
    /**
     * Get the number of channels that are currently cached
     * @returns Number of channels currently cached
     */
    getIndexCount(): Promise<number>;
}
export = ChannelCache;
