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
        this.consumer = null;
        this.producer = null;
        this.ready = false;
    }

    /**
     * Initialize the connector
     * @returns {Promise.<void>}
     */
    async initialize() {

        this.producer = new Kafka.Producer({
            // 'debug': 'all',
            'metadata.broker.list': 'localhost:9092',
            'message.max.bytes': '200000000',
            'dr_cb': true, // delivery report callback
        });
    
        // logging debug messages, if debug is enabled
        this.producer.on('event.log', (log) => { console.log(log); });
    
        // logging all errors
        this.producer.on('event.error', (err) => {
            console.error('Error from producer');
            console.error(err);
        });
    
        this.producer.on('ready', async () => {
            console.log('producer ready')
        });
    
    
        this.producer.on('disconnected', (arg) => {
            console.log(`producer disconnected. ${JSON.stringify(arg)}`);
        });
        this.producer.connect();

        this.consumer = new Kafka.KafkaConsumer({
            // 'debug': 'all',
            'metadata.broker.list': this.options.url,
            'message.max.bytes': '200000000',
            'group.id': 'node-rdkafka-consumer',
            'enable.auto.commit': false
        });

        //logging debug messages, if debug is enabled
        this.consumer.on('event.log', function (log) { console.log(log); });

        //logging all errors
        this.consumer.on('event.error', function (err) {
            console.error('Error from consumer');
            console.error(err);
        });

        //counter to commit offsets every numMessages are received
        var counter = 0;
        var numMessages = 5;
        var thonk = this;
        this.consumer.on('ready', function (arg) {
            console.log('consumer ready.' + JSON.stringify(arg));
            thonk.consumer.subscribe(['test-pre-cache']);
            thonk.consumer.consume();
        });

        this.consumer.on('data', function (m) {

            counter++;
            //committing offsets every numMessages
            if (counter % numMessages === 0) { thonk.consumer.commit(m); }
            // console.log('emit')
            thonk.emit('event', JSON.parse(m.value.toString()));
            // console.log('emmited')
        });

        this.consumer.on('disconnected', function (arg) { console.log('consumer disconnected. ' + JSON.stringify(arg)); });

        //starting the consumer
        await this.consumer.connect();
        this.ready = true;
    }

    /**
     * Forward an event to the outgoing amqp queue
     * @param {Object} event - event that should be forwarded, has to be JSON.stringify-able
     * @returns {Promise.<void>}
     */
    async send(event) {
        // this.channel.sendToQueue(this.options.sendQueue, Buffer.from(JSON.stringify(event)));
        this.producer.produce(this.options.sendQueue, -1, Buffer.from(JSON.stringify(event)));
    }
}

module.exports = KafkaConnector;
