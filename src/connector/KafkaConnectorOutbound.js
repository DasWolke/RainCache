'use strict';
let BaseConnector = require('./BaseConnector');
const Kafka = require('node-rdkafka');

class KafkaConnectorOutbound extends BaseConnector {

    constructor(options, params) {
        super();
        this.options = {
            url: 'localhost:9092',
            queue: 'test-post-cache'
        };
        Object.assign(this.options, options);

        this.params = {
            // 'debug': 'all',
            'metadata.broker.list': this.options.url,
            'message.max.bytes': '200000000',
            'dr_cb': true,
            'enable.auto.commit': true,
        };
        Object.assign(this.params, params);

        this.client = null;
        this.ready = false;
    }

    async initialize() {

        this.client = new Kafka.Producer(this.params);

        // logging debug messages, if debug is enabled
        this.client.on('event.log', (log) => { console.log(log); });

        // logging all errors
        this.client.on('event.error', (err) => {
            console.error('Error from consumer');
            console.error(err);
        });
        
        this.client.on('ready', async () => { console.log('producer ready'); });

        this.client.on('disconnected', (arg) => {
            console.log(`producer disconnected. ${JSON.stringify(arg)}`);
            this.emit('error', 'consumer disconnected. ' + JSON.stringify(arg));
        });

        await this.client.connect();
        this.ready = true;
    }

    async send(event) {
        this.client.produce(this.options.queue, -1, Buffer.from(JSON.stringify(event)));
    }
}

module.exports = KafkaConnectorOutbound;
