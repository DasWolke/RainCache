"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseConnector_1 = __importDefault(require("./BaseConnector"));
/**
 * Direct Connector, useful when using raincache with an existing solution library that runs in the same process
 */
class DirectConnector extends BaseConnector_1.default {
    /**
     * Create a new Direct Connector
     */
    constructor() {
        super();
        this.ready = false;
    }
    /**
     * Init Method, initializes this connector
     */
    initialize() {
        this.ready = true;
        return Promise.resolve(undefined);
    }
    /**
     * Forward a discord event to RainCache
     * @param event received event
     */
    receive(event) {
        this.emit("event", event);
    }
    /**
     * Called when RainCache finishes processing of an event
     * @param event received event
     */
    send(event) {
        /**
         * @event DirectConnector#send
         * @description Emitted once an event was fully processed by RainCache, you can now forward that event somewhere else
         */
        this.emit("send", event);
    }
}
module.exports = DirectConnector;
