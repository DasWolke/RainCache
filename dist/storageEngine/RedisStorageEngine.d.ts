import BaseStorageEngine from "./BaseStorageEngine";
/**
 * StorageEngine which uses redis as a datasource
 */
declare class RedisStorageEngine<T> extends BaseStorageEngine<T> {
    /** whether this storage engine is ready for usage */
    client: import("redis").RedisClient | null;
    /** whether hash objects should be used for storing data */
    useHash: boolean;
    /** options that are passed to the redis client */
    options: import("../types").RedisStorageOptions;
    /**
     * Create a new redis storage engine
     */
    constructor(options?: import("../types").RedisStorageOptions);
    /**
     * Initialize the storage engine and create a connection to redis
     */
    initialize(): Promise<void>;
    /**
     * Get an object from the cache via id
     * @param id id of the object
     */
    get(id: string): Promise<T | null>;
    /**
     * Get an object from the cache via id
     * @param id id of the object
     * @param useHash whether to use hash objects for this action
     */
    get(id: string, useHash: boolean): Promise<string>;
    /**
     * Upsert an object into the cache
     * @param id id of the object
     * @param updateData the new Data which get's merged with the old
     * @param useHash whether to use hash objects for this action
     */
    upsert(id: string, updateData: any, useHash?: boolean): Promise<void>;
    /**
     * Remove an object from the cache
     * @param id id of the object
     * @param useHash whether to use hash objects for this action
     */
    remove(id: string, useHash?: boolean): Promise<void>;
    /**
     * Filter for an object
     * @param fn filter function to use
     * @param ids array of ids that should be used for the filtering
     * @param namespace namespace of the filter
     * @returns filtered data
     */
    filter(fn: (value?: T, index?: number, array?: Array<T>) => unknown, ids: Array<string>, namespace: string): Promise<Array<any>>;
    /**
     * Filter for an object and return after the first search success
     * @param fn filter function to use
     * @param ids array of ids that should be used for the filtering
     * @param namespace namespace of the filter
     * @returns the first result or null if nothing was found
     */
    find(fn: (value?: T, index?: number, array?: Array<string>) => boolean, ids: string[] | null | undefined, namespace: string): Promise<T | null>;
    /**
     * Get a list of values that are part of a list
     * @param listId id of the list
     * @returns array of ids that are members of the list
     */
    getListMembers(listId: string): Promise<Array<string>>;
    /**
     * Add an id (or a list of them) to a list
     * @param listId id of the list
     * @param id array of ids that should be added
     */
    addToList(listId: string, id: string): Promise<void>;
    /**
     * Check if an id is part of a list
     * @param listId id of the list
     * @param id id that should be checked
     */
    isListMember(listId: string, id: string): Promise<boolean>;
    /**
     * Remove an id from a list
     * @param listId id of the list
     * @param id id that should be removed
     */
    removeFromList(listId: string, id: string): Promise<void>;
    /**
     * Remove a list
     * @param listId id of the list
     */
    removeList(listId: string): Promise<void>;
    /**
     * Get the amount of items within a list
     * @param listId id of the list
     */
    getListCount(listId: string): Promise<number>;
    /**
     * Prepare data for storage inside redis
     */
    prepareData(data: T): string;
    /**
     * Parse loaded data
     */
    parseData(data: string | null): T | null;
    /**
     * Prepare a namespace for a KEYS operation by adding a * at the end
     * @param namespace namespace to prepare
     * @returns namespace + *
     */
    prepareNamespace(namespace: string): string;
}
export = RedisStorageEngine;
