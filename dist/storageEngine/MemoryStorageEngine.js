"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseStorageEngine_1 = __importDefault(require("./BaseStorageEngine"));
/**
 * StorageEngine which uses a Map in the process memory space as a datasource
 */
class MemoryStorageEngine extends BaseStorageEngine_1.default {
    constructor() {
        super();
        this.map = new Map();
        this.index = new Map();
    }
    /**
     * Get an object from the cache via id
     * @param id id of the object
     */
    // @ts-ignore
    get(id) {
        const raw = this.map.get(id);
        return this.parseData(raw);
    }
    /**
     * Upsert an object into the cache
     * @param id id of the object
     * @param updateData the new Data which get's merged with the old
     */
    upsert(id, updateData) {
        const data = this.get(id);
        const newData = data || {};
        Object.assign(newData, updateData);
        const prepared = this.prepareData(newData);
        this.map.set(id, prepared);
    }
    /**
     * Remove an object from the cache
     * @param id id of the object
     */
    remove(id) {
        this.map.delete(id);
    }
    /**
     * Filter for an object
     * @param fn filter function to use
     * @param ids array of ids that should be used for the filtering
     * @param namespace namespace of the filter
     * @returns filtered data
     */
    filter(fn, ids, namespace) {
        const resolvedDataArray = [];
        let data = [];
        if (!ids) {
            data = this.getListMembers(namespace);
        }
        else {
            data = ids;
        }
        data = data.map(id => `${namespace}.${id}`);
        for (const key of data) {
            const resolvedData = this.get(key);
            if (resolvedData)
                resolvedDataArray.push(resolvedData);
        }
        return resolvedDataArray.filter(fn);
    }
    /**
     * Filter for an object and return after the first search success
     * @param fn filter function to use
     * @param ids array of ids that should be used for the filtering
     * @param namespace namespace of the filter
     * @returns the first result or null if nothing was found
     */
    find(fn, ids = null, namespace) {
        let data = [];
        if (typeof ids === "string" && !namespace) {
            namespace = ids;
            ids = null;
        }
        if (!ids) {
            data = this.getListMembers(namespace);
        }
        else {
            data = ids;
        }
        data = data.map(id => `${namespace}.${id}`);
        let index = 0;
        for (const key of data) {
            const resolvedData = this.get(key);
            if (resolvedData && fn(resolvedData, index, data)) {
                return resolvedData;
            }
            index++;
        }
        return null;
    }
    /**
     * Get a list of values that are part of a list
     * @param listId id of the list
     * @returns array of ids that are members of the list
     */
    getListMembers(listId) {
        return this.index.get(listId) || [];
    }
    /**
     * Add an id (or a list of them) to a list
     * @param listId id of the list
     * @param id array of ids that should be added
     */
    addToList(listId, id) {
        const list = this.getListMembers(listId);
        if (list.includes(id))
            return;
        else
            list.push(id);
        const listExists = !!this.index.get(listId);
        if (!listExists)
            this.index.set(listId, list);
    }
    /**
     * Check if an id is part of a list
     * @param listId id of the list
     * @param id id that should be checked
     */
    isListMember(listId, id) {
        return this.getListMembers(listId).includes(id);
    }
    /**
     * Remove an id from a list
     * @param listId id of the list
     * @param id id that should be removed
     */
    removeFromList(listId, id) {
        const list = this.getListMembers(listId);
        const index = list.indexOf(id);
        if (index === -1)
            return;
        list.splice(index, 1);
    }
    /**
     * Remove a list
     * @param listId id of the list
     */
    removeList(listId) {
        this.index.delete(listId);
    }
    /**
     * Get the amount of items within a list
     * @param listId id of the list
     */
    getListCount(listId) {
        return this.getListMembers(listId).length;
    }
    /**
     * Prepare data for storage inside redis
     */
    prepareData(data) {
        return JSON.stringify(data);
    }
    /**
     * Parse loaded data
     */
    parseData(data) {
        return data ? JSON.parse(data) : null;
    }
}
module.exports = MemoryStorageEngine;
