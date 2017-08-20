'use strict';

class BaseStorageEngine {
    constructor() {
        this.ready = true;
    }

    initialize() {
        // Initializes the engine, e.g. db connection, etc..
    }

    get (id) {

    }

    upsert(id, data) {

    }

    remove(id) {

    }
}

module.exports = BaseStorageEngine;
