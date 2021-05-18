import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
/**
 * Cache responsible for caching users
 * @extends BaseCache
 */
declare class UserCache extends BaseCache<import("@amanda/discordtypings").UserData> {
    /**
     * Create a new UserCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param storageEngine Storage engine to use for this cache
     * @param boundObject Optional, may be used to bind a user object to the cache
     */
    constructor(storageEngine: BaseStorageEngine<import("@amanda/discordtypings").UserData>, rain: import("../RainCache")<any, any>, boundObject?: import("@amanda/discordtypings").UserData);
    /**
     * Loads a user from the cache via id
     * @param id discord id of the user
     * @returns Returns a User Cache with a bound user or null if no user was found
     */
    get(id?: string | undefined): Promise<UserCache | null>;
    /**
     * Update a user entry in the cache
     * @param id discord id of the user
     * @param data updated data of the user, it will be merged with the old data
     */
    update(id: string | undefined, data: import("@amanda/discordtypings").UserData): Promise<UserCache>;
    /**
     * Remove a user from the cache
     * @param id discord id of the user
     */
    remove(id?: string | undefined): Promise<void>;
    /**
     * Filter for users by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for the filtering
     * @param ids Array of user ids, if omitted the global user index will be used
     */
    filter(fn: (user?: import("@amanda/discordtypings").UserData, index?: number, array?: Array<import("@amanda/discordtypings").UserData>) => unknown, ids?: Array<string> | undefined): Promise<Array<UserCache>>;
    /**
     * Find a user by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for filtering for a user
     * @param ids List of ids that should be used as the scope of the filter
     * @returns Returns a User Cache with a bound user or null if no user was found
     */
    find(fn: (user?: import("@amanda/discordtypings").UserData, index?: number, array?: Array<string>) => unknown, ids?: Array<string> | undefined): Promise<UserCache | null>;
    /**
     * Bind a user id to the cache, used by the member cache
     * @param userId id of the user
     * @returns Returns a UserCache that has an id bound to it, which serves as the default argument to get, update and delete
     */
    bindUserId(userId: string): UserCache;
    /**
     * Add users to the index
     * @param id ids of the users
     */
    addToIndex(id: string): Promise<void>;
    /**
     * Remove a user from the index
     * @param id id of the user
     */
    removeFromIndex(id: string): Promise<void>;
    /**
     * Check if a user is indexed
     * @paramid id of the user
     * @returns True if the user is indexed, false otherwise
     */
    isIndexed(id: string): Promise<boolean>;
    /**
     * Get a list of currently indexed users, since users is a global namespace,
     * this will return **ALL** users that the bot cached currently
     * @returns Array with a list of ids of users that are indexed
     */
    getIndexMembers(): Promise<Array<string>>;
    /**
     * Delete the user index, you should probably **not** use this function, but I won't stop you.
     */
    removeIndex(): Promise<void>;
    /**
     * Get the number of users that are currently cached
     * @returns Number of users currently cached
     */
    getIndexCount(): Promise<number>;
}
export = UserCache;
