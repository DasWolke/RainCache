'use strict';
let EventEmitter;
try {
    EventEmitter = require('eventemiiter3');
} catch (e) {
    EventEmitter = require('events').EventEmitter;
}

/**
 * BaseConnector class, provides a common structure for connectors
 * @extends EventEmitter
 * @private
 */
class BaseConnector extends EventEmitter {
    constructor() {
        super();
        this.ready = false;
    }

    initialize() {
        this.ready = true;
        return Promise.resolve();
    }
}

module.exports = BaseConnector;
