"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseConnector_1 = __importDefault(require("./BaseConnector"));
const amqplib_1 = __importDefault(require("amqplib"));
/**
 * Amqp Connector, used for receiving and sending messages to an amqp based message queue
 */
class AmqpConnector extends BaseConnector_1.default {
    /**
     * Create a new Amqp Connector
     * @param options Options
     * @param options.amqpUrl amqp host to connect to
     * @param options.amqpQueue amqp queue to use for receiving events
     * @param options.sendQueue amqp queue to use for sending events
     */
    constructor(options) {
        super();
        this.options = { amqpUrl: "amqp://localhost", amqpQueue: "test-pre-cache", sendQueue: "test-post-cache" };
        Object.assign(this.options, options);
        this.client = null;
        this.channel = null;
        this.ready = false;
    }
    /**
     * Initializes the connector by creating a new connection to the amqp host set via config and creating a new queue to receive messages from
     */
    async initialize() {
        this.client = await amqplib_1.default.connect(this.options.amqpUrl);
        this.channel = await this.client.createChannel();
        this.ready = true;
        this.channel.assertQueue(this.options.amqpQueue, { durable: false, autoDelete: true });
        this.channel.consume(this.options.amqpQueue, (event) => {
            var _a;
            if (event)
                (_a = this.channel) === null || _a === void 0 ? void 0 : _a.ack(event);
            // console.log(event.content.toString());
            if (event)
                this.emit("event", JSON.parse(event.content.toString()));
        });
    }
    /**
     * Forward an event to the outgoing amqp queue
     * @param event event that should be forwarded, has to be JSON.stringify-able
     */
    async send(event) {
        var _a;
        (_a = this.channel) === null || _a === void 0 ? void 0 : _a.sendToQueue(this.options.sendQueue, Buffer.from(JSON.stringify(event)));
    }
}
module.exports = AmqpConnector;
