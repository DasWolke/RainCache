import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
/**
 * Cache responsible for storing role related data
 */
declare class RoleCache extends BaseCache<import("discord-typings").RoleData> {
    namespace: "role";
    /**
     * Create a new RoleCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param storageEngine Storage engine to use for this cache
     * @param boundObject Optional, may be used to bind a role object to the cache
     */
    constructor(storageEngine: BaseStorageEngine<import("discord-typings").RoleData>, rain: import("../RainCache")<any, any>, boundObject?: import("discord-typings").RoleData);
    /**
     * Get a role via id and guild id of the role
     * @param id id of the role
     * @param guildId id of the guild belonging to the role
     * @returns Returns a Role Cache with a bound role or null if no role was found
     */
    get(id: string, guildId: string): Promise<RoleCache | null>;
    /**
     * Update a role
     * @param id - id of the role
     * @param guildId - id of the guild belonging to the role
     * @param data - new role data
     * @returns returns a bound RoleCache once the data was updated.
     */
    update(id: string, guildId: string, data: import("discord-typings").RoleData & {
        guild_id?: string;
    }): Promise<RoleCache>;
    /**
     * Remove a role from the cache
     * @param id id of the role
     * @param guildId id of the guild belonging to the role
     */
    remove(id: string, guildId: string): Promise<void>;
    /**
     * Filter for roles by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for the filtering
     * @param guildId id of the guild belonging to the roles
     * @param ids array of role ids that should be used for the filtering
     * @returns array of bound role caches
     */
    filter(fn: (role?: import("discord-typings").RoleData, index?: number, array?: Array<import("discord-typings").RoleData>) => unknown, guildId?: string | undefined, ids?: Array<string> | undefined): Promise<Array<RoleCache>>;
    /**
     * Find a role by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for filtering for a single role
     * @param guildId id of the guild belonging to the roles
     * @param ids array of role ids that should be used for the filtering
     * @returns bound role cache
     */
    find(fn: (role?: import("discord-typings").RoleData, index?: number, array?: Array<string>) => unknown, guildId?: string | undefined, ids?: Array<string> | undefined): Promise<RoleCache | null>;
    /**
     * Build a unique key for the role cache entry
     * @param roleId id of the role
     * @param guildId id of the guild belonging to the role
     * @returns the prepared key
     */
    buildId(roleId: string, guildId?: string): string;
}
export = RoleCache;
