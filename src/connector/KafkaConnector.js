'use strict';
let BaseConnector = require('./BaseConnector');
const Kafka = require('node-rdkafka');

/**
 * Amqp Connector, used for receiving and sending messages to an amqp based message queue
 */
class KafkaConnector extends BaseConnector {
    /**
     * Create a new Amqp Connector
     * @param {Object} options - Options
     * @param {String} [options.url=localhost:9092] - amqp host to connect to
     * @param {String} [options.queue=test-pre-cache] - amqp queue to use for receiving events
     * @param {String} [options.sendQueue=test-post-cache] - amqp queue to use for sending events
     */
    constructor(options) {
        super();
        this.options = {url: 'localhost:9092', queue: 'test-pre-cache', sendQueue: 'test-post-cache'};
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
        this.channel = new Kafka.KafkaConsumer({
            // 'debug': 'all',
            'metadata.broker.list': this.options.url,
            'message.max.bytes': '200000000',
            'group.id': 'node-rdkafka-consumer',
            'enable.auto.commit': false
        });

        //logging debug messages, if debug is enabled
        this.channel.on('event.log', function (log) { console.log(log); });

        //logging all errors
        this.channel.on('event.error', function (err) {
            console.error('Error from consumer');
            console.error(err);
        });

        //counter to commit offsets every numMessages are received
        var counter = 0;
        var numMessages = 5;
        var thonk = this;
        this.channel.on('ready', function (arg) {
            console.log('consumer ready.' + JSON.stringify(arg));
            thonk.channel.subscribe(['test-pre-cache']);
            thonk.channel.consume();
        });

        this.channel.on('data', function (m) {

            counter++;
            //committing offsets every numMessages
            if (counter % numMessages === 0) { thonk.channel.commit(m); }
            cosnole.log('emit')
            this.emit('event', JSON.parse(m.value.toString()));
            console.log('emmited')
        });

        this.channel.on('disconnected', function (arg) { console.log('consumer disconnected. ' + JSON.stringify(arg)); });

        //starting the consumer
        await this.channel.connect();
        this.ready = true;
    }

    /**
     * Forward an event to the outgoing amqp queue
     * @param {Object} event - event that should be forwarded, has to be JSON.stringify-able
     * @returns {Promise.<void>}
     */
    async send(event) {
        // this.channel.sendToQueue(this.options.sendQueue, Buffer.from(JSON.stringify(event)));
        this.channel.produce(this.options.sendQueue, -1, Buffer.from(JSON.stringify(event)));
    }
}

module.exports = KafkaConnector;
