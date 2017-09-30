'use strict';
let BaseConnector = require('./BaseConnector');
let amqp = require('amqplib');

class AqmpConnector extends BaseConnector {
    constructor(options) {
        super();
        this.options = {amqpUrl: 'amqp://localhost', amqpQueue: 'test-pre-cache'};
        Object.assign(this.options, options);
        this.client = null;
        this.channel = null;
        this.ready = false;
    }

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

    async send(event) {
        this.channel.sendToQueue('test-post-cache', Buffer.from(JSON.stringify(event)));
    }
}

module.exports = AqmpConnector;
