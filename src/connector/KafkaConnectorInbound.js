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
            // 'debug': 'all',
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

        const scope = this;
        this.client = new Kafka.KafkaConsumer(this.params);

        this.client.on('event.log', function (log) { scope.emit('log', log); });
        this.client.on('event.error', function (err) { scope.emit('error', err); });
        this.client.on('data', function (message) { scope.emit('event', JSON.parse(message.value.toString())); });

        this.client.on('ready', function (arg) {
            console.log('consumer ready.' + JSON.stringify(arg));
            scope.client.subscribe([scope.options.queue]);
            scope.client.consume();
        });

        this.client.on('disconnected', function (arg) {
            scope.emit('error', 'consumer disconnected. ' + JSON.stringify(arg));
            console.log('consumer disconnected. ' + JSON.stringify(arg));
        });

        await this.client.connect();
        this.ready = true;
    }
}

module.exports = KafkaConnectorInbound;

