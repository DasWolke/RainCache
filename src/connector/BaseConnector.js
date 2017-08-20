'use strict';
let EventEmitter;
try {
    EventEmitter = require('eventemiiter3');
} catch (e) {
    EventEmitter = require('events').EventEmitter;
}

class BaseConnector extends EventEmitter {
    constructor() {
        super();
    }

    initialize() {
        return Promise.resolve();
    }
}

module.exports = BaseConnector;
