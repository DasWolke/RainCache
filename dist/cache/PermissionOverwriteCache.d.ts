import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
/**
 * Cache used for saving overwrites of permissions belonging to channels
 * @extends BaseCache
 */
declare class PermissionOverwriteCache extends BaseCache<any> {
    boundChannel: string;
    namespace: "permissionoverwrite";
    /**
     * Create a new PermissionOverwriteCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param storageEngine Storage engine to use for this cache
     * @param boundObject Optional, may be used to bind a permission overwrite object to this cache
     */
    constructor(storageEngine: BaseStorageEngine<any>, rain: import("../RainCache")<any, any>, boundObject?: any);
    /**
     * Get a permission overwrite via id
     * @param id id of the permission overwrite
     * @param channelId - id of the channel that belongs to the permission overwrite
     * @returns returns a bound permission overwrite cache or null if nothing was found
     */
    get(id: string, channelId?: string): Promise<PermissionOverwriteCache | null>;
    /**
     * Update a permission overwrite entry in the cache
     * @param id id of the permission overwrite
     * @param channelId id of the channel that belongs to the permission overwrite
     * @param data updated permission overwrite data, will be merged with the old data
     * @returns returns a bound permission overwrite cache
     */
    update(id: string, channelId: string | undefined, data: any): Promise<PermissionOverwriteCache>;
    /**
     * Remove a permission overwrite entry from the cache
     * @param id id of the permission overwrite
     * @param channelId id of the channel that belongs to the permission overwrite
     */
    remove(id: string, channelId?: string): Promise<void>;
    /**
     * Filter for permission overwrites by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for the filtering
     * @param channelId id of the channel that belongs to the permission overwrite
     * @param ids Array of permission overwrite ids, if omitted the permission overwrite index will be used
     * @returns returns an array of bound permission overwrite caches
     */
    filter(fn: (overwrite?: any, index?: number, array?: Array<any>) => unknown, channelId?: string, ids?: Array<string> | undefined): Promise<Array<PermissionOverwriteCache>>;
    /**
     * Find a permission overwrite by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for the filtering
     * @param channelId id of the channel that belongs to the permission overwrite
     * @param ids Array of permission overwrite ids, if omitted the permission overwrite index will be used
     * @returns returns a bound permission overwrite cache
     */
    find(fn: (overwrite?: any, index?: any, array?: Array<string>) => unknown, channelId?: string, ids?: Array<string> | undefined): Promise<PermissionOverwriteCache | null>;
    /**
     * Build a unique key for storing the data in the datasource
     * @param permissionId id of the permission overwrite
     * @param channelId id of the channel that belongs to the permission overwrite
     */
    buildId(permissionId: string, channelId?: string): string;
    /**
     * Bind a channel id to this permission overwrite cache
     * @param channelId id of the channel that belongs to the permission overwrite
     * @returns returns a permission overwrite cache with boundChannel set to the passed channelId
     */
    bindChannel(channelId: string): PermissionOverwriteCache;
}
export = PermissionOverwriteCache;
