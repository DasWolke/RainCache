"use strict";
const events_1 = require("events");
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
