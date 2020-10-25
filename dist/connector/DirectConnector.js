"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseConnector_1 = __importDefault(require("./BaseConnector"));
class DirectConnector extends BaseConnector_1.default {
    constructor() {
        super();
        this.ready = false;
    }
    initialize() {
        this.ready = true;
        return Promise.resolve(undefined);
    }
    receive(event) {
        this.emit("event", event);
    }
    send(event) {
        this.emit("send", event);
    }
}
module.exports = DirectConnector;
