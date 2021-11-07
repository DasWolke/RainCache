"use strict";
const events_1 = require("events");
/**
 * BaseConnector class, provides a common structure for connectors
 */
class BaseConnector extends events_1.EventEmitter {
    constructor() {
        super();
        this.ready = false;
    }
    initialize() {
        this.ready = true;
        return Promise.resolve();
    }
    send(event) { void event; }
}
module.exports = BaseConnector;
