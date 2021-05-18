import BaseConnector from "./BaseConnector";
import amqp from "amqplib";
/**
 * Amqp Connector, used for receiving and sending messages to an amqp based message queue
 */
declare class AmqpConnector extends BaseConnector {
    options: {
        amqpUrl: string;
        amqpQueue: string;
        sendQueue: string;
    };
    client: amqp.Connection | null;
    channel: amqp.Channel | null;
    /**
     * Create a new Amqp Connector
     * @param options Options
     * @param options.amqpUrl amqp host to connect to
     * @param options.amqpQueue amqp queue to use for receiving events
     * @param options.sendQueue amqp queue to use for sending events
     */
    constructor(options?: {
        amqpUrl?: string;
        amqpQueue?: string;
        sendQueue?: string;
    });
    /**
     * Initializes the connector by creating a new connection to the amqp host set via config and creating a new queue to receive messages from
     */
    initialize(): Promise<void>;
    /**
     * Forward an event to the outgoing amqp queue
     * @param event event that should be forwarded, has to be JSON.stringify-able
     */
    send(event: any): Promise<void>;
}
export = AmqpConnector;
