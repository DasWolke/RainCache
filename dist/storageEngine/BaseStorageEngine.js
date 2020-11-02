"use strict";
class BaseStorageEngine {
    constructor() {
        this.ready = true;
    }
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
