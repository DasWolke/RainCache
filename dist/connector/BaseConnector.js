"use strict";
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
    send(event) { }
}
module.exports = BaseConnector;
