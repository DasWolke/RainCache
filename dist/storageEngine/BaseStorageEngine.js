"use strict";
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Base Storage engine class defining the methods being used by RainCache that a storage engine is supposed to have
 */
class BaseStorageEngine {
    constructor() {
        this.ready = true;
    }
    /** Initializes the engine, e.g. db connection, etc.. */
    initialize() { }
    get(id, useHash) { return null; }
    upsert(id, data) { }
    remove(id, useHash) { }
    getListMembers(listId) { return ["null"]; }
    addToList(listId, id) { }
    isListMember(listId, id) { return false; }
    removeFromList(listId, id) { }
    removeList(listId) { }
    getListCount(listId) { return 0; }
    filter(fn, ids, namespace) { return []; }
    find(fn, ids, namespace) { return null; }
}
module.exports = BaseStorageEngine;
