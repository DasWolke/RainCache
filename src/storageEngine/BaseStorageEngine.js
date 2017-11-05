'use strict';

/**
 * Base Storage engine class defining the methods being used by RainCache that a storage engine is supposed to have
 * @private
 */
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

    addToList(listId, ids) {

    }

    isListMember(listId, id) {

    }

    removeFromList(listId, id) {

    }

    removeList(listId) {

    }

    getListCount(listId) {

    }
}

module.exports = BaseStorageEngine;
