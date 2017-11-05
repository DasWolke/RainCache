'use strict';
let BaseConnector = require('./BaseConnector');
let amqp = require('amqp');

/**
 * Amqp Connector, used for receiving and sending messages to an amqp based message queue
 * @extends BaseConnector
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
    initialize() {
        return new Promise((res, rej) => {
            let connection = amqp.createConnection({host: 'localhost'});
            connection.on('error', (e) => {
                console.error(e);
                return rej();
            });
            connection.on('ready', () => {
                this.client = connection;
                let q = connection.queue(this.options.amqpQueue, (queue) => {
                    queue.bind('#');
                    this.ready = true;
                    queue.subscribe((event) => {
                        this.emit('event', event);
                    });
                    return res();
                });

            });
        });
    }

    /**
     * Forward an event to the outgoing amqp queue
     * @param {Object} event - event that should be forwarded, has to be JSON.stringify-able
     * @returns {Promise.<void>}
     */
    async send(event) {
        this.client.publish(this.options.sendQueue, event);
    }
}

module.exports = AqmpConnector;
