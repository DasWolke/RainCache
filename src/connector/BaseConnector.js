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
    /**
     * @private
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
