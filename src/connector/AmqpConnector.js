'use strict';
let BaseConnector = require('./BaseConnector');
let amqp = require('amqplib');

class AqmpConnector extends BaseConnector {
    constructor(options) {
        super();
        this.options = options;
        this.client = null;
        this.ready = false;
    }

    async initialize() {
        let connection = await amqp.connect('amqp://localhost');
        let channel = await connection.createChannel();
        this.ready = true;
        channel.assertQueue('test', {durable: false, autoDelete: true});
        channel.consume('test', (event) => {
            // console.log(event.content.toString());
            this.emit('event', JSON.parse(event.content.toString()));
        });

    }
}

module.exports = AqmpConnector;
