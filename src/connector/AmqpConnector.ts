import BaseConnector from "./BaseConnector";
import amqp from "amqplib";

import { AMQPOptions } from "../types";

const NoChannelError = new Error("No Amqp channel. Was the Connector ever initialized?");

/**
 * Amqp Connector, used for receiving and sending messages to an amqp based message queue
 */
class AmqpConnector extends BaseConnector {
	public options: AMQPOptions;
	public client: amqp.Connection | null = null;
	public channel: amqp.Channel | null = null;

	/**
	 * Create a new Amqp Connector
	 */
	public constructor(options?: Partial<AMQPOptions>) {
		super();
		this.options = Object.assign({ amqpUrl: "amqp://localhost", amqpQueue: "test-pre-cache", sendQueue: "test-post-cache" }, options);
	}

	/**
	 * Initializes the connector by creating a new connection to the amqp host set via config and creating a new queue to receive messages from
	 */
	public async initialize(): Promise<void> {
		this.client = await amqp.connect(this.options.amqpUrl);
		this.channel = await this.client.createChannel();
		this.ready = true;
		this.channel.assertQueue(this.options.amqpQueue, { durable: false, autoDelete: true });
		this.channel.consume(this.options.amqpQueue, event => {
			if (!event) return;
			if (!this.channel) throw NoChannelError;
			this.channel.ack(event);
			/**
			 * @event AmqpConnector#event
			 * @description Emitted once an event was received by RainCache
			 */
			this.emit("event", JSON.parse(event.content.toString()));
		});
	}

	/**
	 * Forward an event to the outgoing amqp queue
	 * @param event event that should be forwarded, has to be JSON.stringify-able
	 */
	public async send(event: any): Promise<void> {
		if (!this.channel) throw new Error(NoChannelError.message); // Retain the stack relative to this frame so the user can debug
		/**
		 * @event AmqpConnector#send
		 * @description Emitted once an event was fully processed by RainCache, you can now forward that event somewhere else
		 */
		this.emit("send", event);
		this.channel.sendToQueue(this.options.sendQueue, Buffer.from(JSON.stringify(event)));
	}
}

export default AmqpConnector;
