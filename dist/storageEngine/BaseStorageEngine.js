"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Base Storage engine class defining the methods being used by RainCache that a storage engine is supposed to have
 */
class BaseStorageEngine {
    constructor() {
        this.ready = true;
    }
    /** Initializes the engine, e.g. db connection, etc.. */
    initialize() { void 0; }
    get(id, useHash) { return null; }
    upsert(id, data) { void 0; }
    remove(id, useHash) { void 0; }
    getListMembers(listId) { return ["null"]; }
    addToList(listId, id) { void 0; }
    isListMember(listId, id) { return false; }
    removeFromList(listId, id) { void 0; }
    removeList(listId) { void 0; }
    getListCount(listId) { return 0; }
    filter(fn, ids, namespace) { return []; }
    find(fn, ids, namespace) { return null; }
}
module.exports = BaseStorageEngine;
