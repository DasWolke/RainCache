import BaseStorageEngine from "./BaseStorageEngine";
/**
 * StorageEngine which uses a Map in the process memory space as a datasource
 */
declare class MemoryStorageEngine<T> extends BaseStorageEngine<T> {
    map: Map<string, string>;
    index: Map<string, Array<string>>;
    constructor();
    /**
     * Get an object from the cache via id
     * @param id id of the object
     */
    get(id: string): T | null;
    get(id: string, DO_NOT_USE_THIS_OVERLOAD?: unknown): string | Promise<string>;
    /**
     * Upsert an object into the cache
     * @param id id of the object
     * @param updateData the new Data which get's merged with the old
     */
    upsert(id: string, updateData: T): void;
    /**
     * Remove an object from the cache
     * @param id id of the object
     */
    remove(id: string): void;
    /**
     * Filter for an object
     * @param fn filter function to use
     * @param ids array of ids that should be used for the filtering
     * @param namespace namespace of the filter
     * @returns filtered data
     */
    filter(fn: (value?: T, index?: number, array?: Array<T>) => unknown, ids: Array<string>, namespace: string): Array<T>;
    /**
     * Filter for an object and return after the first search success
     * @param fn filter function to use
     * @param ids array of ids that should be used for the filtering
     * @param namespace namespace of the filter
     * @returns the first result or null if nothing was found
     */
    find(fn: (value?: T, index?: number, array?: Array<string>) => boolean, ids: string[] | null | undefined, namespace: string): T | null;
    /**
     * Get a list of values that are part of a list
     * @param listId id of the list
     * @returns array of ids that are members of the list
     */
    getListMembers(listId: string): Array<string>;
    /**
     * Add an id (or a list of them) to a list
     * @param listId id of the list
     * @param id array of ids that should be added
     */
    addToList(listId: string, id: string): void;
    /**
     * Check if an id is part of a list
     * @param listId id of the list
     * @param id id that should be checked
     */
    isListMember(listId: string, id: string): boolean;
    /**
     * Remove an id from a list
     * @param listId id of the list
     * @param id id that should be removed
     */
    removeFromList(listId: string, id: string): void;
    /**
     * Remove a list
     * @param listId id of the list
     */
    removeList(listId: string): void;
    /**
     * Get the amount of items within a list
     * @param listId id of the list
     */
    getListCount(listId: string): number;
    /**
     * Prepare data for storage inside redis
     */
    private prepareData;
    /**
     * Parse loaded data
     */
    private parseData;
}
export = MemoryStorageEngine;
