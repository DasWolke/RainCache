'use strict';

class BaseStorageEngine {
    constructor() {
        this.ready = true;
    }

    initialize() {
        // Initializes the engine, e.g. db connection, etc..
    }

    get(id) {

    }

    upsert(id, data) {

    }

    remove(id) {

    }

    getListMembers(listid) {

    }

    addToList(ids, listId) {

    }

    isListMember(id, listId) {

    }

    removeFromList(id, listId) {

    }

    removeList(listId) {

    }

    getListCount(listId) {

    }
}

module.exports = BaseStorageEngine;
