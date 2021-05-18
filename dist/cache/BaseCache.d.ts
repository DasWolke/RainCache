declare class BaseCache<T> {
    storageEngine: import("../storageEngine/BaseStorageEngine")<T> | null;
    namespace: string;
    dataTimestamp?: Date;
    boundObject: T | null;
    /** guild id bound to this cache */
    boundGuild?: string;
    rain: import("../RainCache")<any, any>;
    /**
     * Base class for all cache classes.
     *
     * You should **not** create BaseCache by itself, but instead create a class that extends from it.
     *
     * **All Methods from BaseCache are also available on every class that is extending it.**
     */
    constructor(rain: import("../RainCache")<any, any>);
    /**
     * Bind an object to the cache instance, you can read more on binding on the landing page of the documentation
     * @param boundObject - Object to bind to this cache instance
     */
    bindObject(boundObject: T): void;
    /**
     * Bind a guild id to the cache
     * @param guildId id of the guild that should be bound to this cache
     */
    bindGuild(guildId: string): this;
    /**
     * Build an id consisting of $namespace.$id
     * @param id id to append to namespace
     * @returns constructed id
     */
    buildId(id: string): string;
    /**
     * Add ids to the index of a namespace
     * @param id ids to add
     * @param objectId id of the parent object of the index
     */
    addToIndex(id: string, objectId?: string): Promise<void>;
    /**
     * Remove an id from the index
     * @param id id to be removed
     * @param objectId id of the parent object of the index
     */
    removeFromIndex(id: string, objectId?: string): Promise<void>;
    /**
     * Check if an id is a member of an index
     * @param id id to check
     * @param objectId id of the parent object of the index
     * @returns returns true if it is a part of the index, false otherwise
     */
    isIndexed(id: string, objectId?: string): Promise<boolean>;
    /**
     * Get all members from an index
     * @param objectId id of the parent object of the index
     */
    getIndexMembers(objectId?: string): Promise<Array<string>>;
    /**
     * Delete an index
     * @param objectId id of the parent object of the index
     */
    removeIndex(objectId?: string): Promise<void>;
    /**
     * Get the number of elements that are within an index
     * @param objectId id of the parent object of the index
     */
    getIndexCount(objectId?: string): Promise<number>;
    /**
     * Delete keys from data if necessary based on RainCache structureDefs options and return the cleaned data
     * @param data The data to possibly delete object entries from
     */
    structurize<T>(data: T): T;
}
export = BaseCache;
