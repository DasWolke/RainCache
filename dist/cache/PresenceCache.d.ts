import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
/**
 * Cache responsible for storing presence related data
 */
declare class PresenceCache extends BaseCache<import("discord-typings").PresenceData> {
    namespace: "presence";
    userCache: import("./UserCache");
    /**
     * Create a new Presence Cache
     *
     * **This class is automatically instantiated by RainCache**
     * @param storageEngine Storage engine to use for this cache
     * @param boundObject Optional, may be used to bind a presence object to the cache
     */
    constructor(storageEngine: BaseStorageEngine<import("discord-typings").PresenceData>, userCache: import("./UserCache"), rain: import("../RainCache")<any, any>, boundObject?: import("discord-typings").PresenceData);
    /**
     * Get a presence via user id
     * @param id id of a discord user
     * @returns Returns a new PresenceCache with bound data or null if nothing was found
     */
    get(id: string): Promise<PresenceCache | null>;
    /**
     * Upsert the presence of a user.
     *
     * **This function automatically removes the guild_id, roles and user of a presence update before saving it**
     * @param id id of the user the presence belongs to
     * @param data updated presence data of the user
     * @returns returns a bound presence cache
     */
    update(id: string, data: Partial<import("discord-typings").PresenceData>): Promise<PresenceCache>;
    /**
     * Remove a stored presence from the cache
     * @param id id of the user the presence belongs to
     */
    remove(id: string): Promise<void>;
}
export = PresenceCache;
