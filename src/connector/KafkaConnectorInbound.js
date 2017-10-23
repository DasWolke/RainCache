'use strict';
const BaseConnector = require('./BaseConnector');
const Kafka = require('node-rdkafka');

class KafkaConnectorInbound extends BaseConnector {

    constructor(options, params) {
        super();
        this.options = {
            url: 'localhost:9092',
            queue: 'test-pre-cache',
        };
        Object.assign(this.options, options);

        this.params = {
            'debug': 'all',
            'metadata.broker.list': this.options.url,
            'message.max.bytes': '200000000',
            'group.id': 'node-rdkafka-consumer',
            'enable.auto.commit': true
        };
        Object.assign(this.params, params);

        this.client = null;
        this.ready = false;
    }

    async initialize() {

        this.client = new Kafka.KafkaConsumer(this.params);

        // logging debug messages, if debug is enabled
        connection.on('event.log', (log) => { console.log(log); });

        // logging all errors
        connection.on('event.error', (err) => {
            console.error('Error from consumer');
            console.error(err);
        });
        
        this.client.on('data', (message) => { this.emit('event', JSON.parse(message.value.toString())); });

        this.client.on('ready', (arg) => {
            console.log('consumer ready.' + JSON.stringify(arg));
            this.client.subscribe([this.options.queue]);
            this.client.consume();
        });

        this.client.on('disconnected', (arg) => { 
            this.emit('error', 'consumer disconnected. ' + JSON.stringify(arg));
            console.log('consumer disconnected. ' + JSON.stringify(arg));
        });

        await this.client.connect();
        this.ready = true;
    }
}

module.exports = KafkaConnectorInbound;

