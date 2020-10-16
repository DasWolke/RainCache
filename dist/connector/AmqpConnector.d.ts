import BaseConnector from "./BaseConnector";
import amqp from "amqplib";
declare class AmqpConnector extends BaseConnector {
    options: {
        amqpUrl: string;
        amqpQueue: string;
        sendQueue: string;
    };
    client: amqp.Connection | null;
    channel: amqp.Channel | null;
    constructor(options?: {
        amqpUrl?: string;
        amqpQueue?: string;
        sendQueue?: string;
    });
    initialize(): Promise<void>;
    send(event: any): Promise<void>;
}
export = AmqpConnector;
