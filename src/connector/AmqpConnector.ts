import BaseConnector from "./BaseConnector";
import amqp from "amqplib";

/**
 * Amqp Connector, used for receiving and sending messages to an amqp based message queue
 */
class AmqpConnector extends BaseConnector {
	public options: { amqpUrl: string; amqpQueue: string; sendQueue: string; };
	public client: amqp.Connection | null;
	public channel: amqp.Channel | null;

	/**
	 * Create a new Amqp Connector
	 * @param options Options
	 * @param options.amqpUrl amqp host to connect to
	 * @param options.amqpQueue amqp queue to use for receiving events
	 * @param options.sendQueue amqp queue to use for sending events
	 */
	constructor(options?: { amqpUrl?: string, amqpQueue?: string, sendQueue?: string }) {
		super();
		this.options = { amqpUrl: "amqp://localhost", amqpQueue: "test-pre-cache", sendQueue: "test-post-cache" };
		Object.assign(this.options, options);
		this.client = null;
		this.channel = null;
		this.ready = false;
	}

	/**
	 * Initializes the connector by creating a new connection to the amqp host set via config and creating a new queue to receive messages from
	 */
	async initialize(): Promise<void> {
		this.client = await amqp.connect(this.options.amqpUrl);
		this.channel = await this.client.createChannel();
		this.ready = true;
		this.channel.assertQueue(this.options.amqpQueue, {durable: false, autoDelete: true});
		this.channel.consume(this.options.amqpQueue, (event) => {
			this.channel.ack(event);
			// console.log(event.content.toString());
			this.emit("event", JSON.parse(event.content.toString()));
		});
	}

	/**
	 * Forward an event to the outgoing amqp queue
	 * @param event event that should be forwarded, has to be JSON.stringify-able
	 */
	async send(event: any): Promise<void> {
		this.channel.sendToQueue(this.options.sendQueue, Buffer.from(JSON.stringify(event)));
	}
}

export = AmqpConnector;
