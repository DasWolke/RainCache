'use strict';
let BaseConnector = require('./BaseConnector');
let amqp = require('amqplib');

/**
 * Amqp Connector, used for receiving and sending messages to an amqp based message queue
 * @extends BaseConnector
 */
class AmqpConnector extends BaseConnector {
    /**
     * Create a new Amqp Connector
     * @param {Object} options - Options
     * @param {String} [options.amqpUrl=amqp://localhost] - amqp host to connect to
     * @param {String} [options.amqpQueue=test-pre-cache] - amqp queue to use for receiving events
     * @param {String} [options.sendQueue=test-post-cache] - amqp queue to use for sending events
     * @extends {BaseConnector}
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
     * Initializes the connector by creating a new connection to the amqp host set via config and creating a new queue to receive messages from
     * @returns {Promise.<void>}
     */
    async initialize() {
        this.client = await amqp.connect(this.options.amqpUrl);
        this.channel = await this.client.createChannel();
        this.ready = true;
        this.channel.assertQueue(this.options.amqpQueue, {durable: false, autoDelete: true});
        this.channel.consume(this.options.amqpQueue, (event) => {
            this.channel.ack(event);
            // console.log(event.content.toString());
            let data = JSON.parse(event.content.toString());
            data.receive = Date.now();
            this.emit('event', data);
        });
    }

    /**
     * Forward an event to the outgoing amqp queue
     * @param {Object} event - event that should be forwarded, has to be JSON.stringify-able
     * @returns {Promise.<void>}
     */
    async send(event) {
        if (event.t !== 'PRESENCE_UPDATE') {
            //console.log(`event ${event.t} took ${Date.now() - event.receive}ms`);
        }
        this.channel.sendToQueue(this.options.sendQueue, Buffer.from(JSON.stringify(event)));
    }
}

module.exports = AmqpConnector;
