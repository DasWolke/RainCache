'use strict';
let BaseConnector = require('./BaseConnector');

/**
 * Direct Connector, useful when using raincache with an existing solution library that runs in the same process
 * @extends BaseConnector
 */
class DirectConnector extends BaseConnector {
    /**
     * Create a new Direct Connector
     */
    constructor() {
        super();
        this.ready = false;
    }

    /**
     * Init Method, initializes this connector
     * @returns {Promise.<null>}
     */
    async initialize() {
        this.ready = true;
        return Promise.resolve();
    }

    /**
     * Forward a discord event to RainCache
     * @param {Object} event - received event
     */
    receive(event) {
        this.emit('event', event);
    }
}

module.exports = DirectConnector;
