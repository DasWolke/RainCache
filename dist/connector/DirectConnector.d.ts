import BaseConnector from "./BaseConnector";
/**
 * Direct Connector, useful when using raincache with an existing solution library that runs in the same process
 */
declare class DirectConnector extends BaseConnector {
    /**
     * Create a new Direct Connector
     */
    constructor();
    /**
     * Init Method, initializes this connector
     */
    initialize(): Promise<void>;
    /**
     * Forward a discord event to RainCache
     * @param event received event
     */
    receive(event: any): void;
    /**
     * Called when RainCache finishes processing of an event
     * @param event received event
     */
    send(event: any): void;
}
export = DirectConnector;
