'use strict';
let BaseConnector = require('./BaseConnector');
let amqp = require('amqplib');

/**
 * Amqp Connector, used for receiving and sending messages to an amqp based message queue
 */
class AqmpConnector extends BaseConnector {
    /**
     * Create a new Amqp Connector
     * @param {Object} options - Options
     * @param {String} [options.amqpUrl=amqp://localhost] - amqp host to connect to
     * @param {String} [options.amqpQueue=test-pre-cache] - amqp queue to use for receiving events
     * @param {String} [options.sendQueue=test-post-cache] - amqp queue to use for sending events
     */
    constructor(options) {
        super();
        this.options = {amqpUrl: 'amqp://localhost', amqpQueue: 'test-pre-cache', sendQueue: 'test-post-cache'};
        Object.assign(this.options, options);
        this.client = null;
        this.channel = null;
        this.ready = false;
    }

    /**
     * Initialize the connector
     * @returns {Promise.<void>}
     */
    async initialize() {
        this.client = await amqp.connect(this.options.amqpUrl);
        this.channel = await this.client.createChannel();
        this.ready = true;
        this.channel.assertQueue(this.options.amqpQueue, {durable: false, autoDelete: true});
        this.channel.consume(this.options.amqpQueue, (event) => {
            // console.log(event.content.toString());
            this.emit('event', JSON.parse(event.content.toString()));
        });
    }

    /**
     * Forward an event to the outgoing amqp queue
     * @param {Object} event - event that should be forwarded, has to be JSON.stringify-able
     * @returns {Promise.<void>}
     */
    async send(event) {
        this.channel.sendToQueue(this.options.sendQueue, Buffer.from(JSON.stringify(event)));
    }
}

module.exports = AqmpConnector;
