'use strict';
let EventEmitter;
try {
    EventEmitter = require('eventemitter3');
} catch (e) {
    EventEmitter = require('events').EventEmitter;
}

/**
 * BaseConnector class, provides a common structure for connectors
 * @extends EventEmitter
 */
class BaseConnector extends EventEmitter {
    /**
     * The BaseConnector is the class that a user-created connector should extend,
     * since it provides all necessary methods to allow RainCache to properly work
     * with the user-created connector
     */
    constructor() {
        super();
        this.ready = false;
    }

    /**
     * Initializes the connector, use this to open a connection to the transport medium used
     * @return {Promise<void>}
     */
    initialize() {
        this.ready = true;
        return Promise.resolve();
    }

    /**
     * When passing a connector for the outboundConnector argument,
     * this function will be called once RainCache finished processing the event and it can be safely shipped to workers
     * @param {Object} event
     */
    send(event) {

    }

}

module.exports = BaseConnector;
