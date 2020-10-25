"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseConnector_1 = __importDefault(require("./BaseConnector"));
const amqplib_1 = __importDefault(require("amqplib"));
class AmqpConnector extends BaseConnector_1.default {
    constructor(options) {
        super();
        this.options = { amqpUrl: "amqp://localhost", amqpQueue: "test-pre-cache", sendQueue: "test-post-cache" };
        Object.assign(this.options, options);
        this.client = null;
        this.channel = null;
        this.ready = false;
    }
    async initialize() {
        this.client = await amqplib_1.default.connect(this.options.amqpUrl);
        this.channel = await this.client.createChannel();
        this.ready = true;
        this.channel.assertQueue(this.options.amqpQueue, { durable: false, autoDelete: true });
        this.channel.consume(this.options.amqpQueue, (event) => {
            var _a;
            if (event)
                (_a = this.channel) === null || _a === void 0 ? void 0 : _a.ack(event);
            if (event)
                this.emit("event", JSON.parse(event.content.toString()));
        });
    }
    async send(event) {
        var _a;
        (_a = this.channel) === null || _a === void 0 ? void 0 : _a.sendToQueue(this.options.sendQueue, Buffer.from(JSON.stringify(event)));
    }
}
module.exports = AmqpConnector;
