import { EventEmitter } from "events";

export interface BaseConnectorEvents {
	event: [any];
	send: [any];
}

interface BaseConnector {
	addListener<E extends keyof BaseConnectorEvents>(event: E, listener: (...args: BaseConnectorEvents[E]) => any): this;
	emit<E extends keyof BaseConnectorEvents>(event: E, ...args: BaseConnectorEvents[E]): boolean;
	eventNames(): Array<keyof BaseConnectorEvents>;
	listenerCount(event: keyof BaseConnectorEvents): number;
	listeners(event: keyof BaseConnectorEvents): Array<(...args: Array<any>) => any>;
	off<E extends keyof BaseConnectorEvents>(event: E, listener: (...args: BaseConnectorEvents[E]) => any): this;
	on<E extends keyof BaseConnectorEvents>(event: E, listener: (...args: BaseConnectorEvents[E]) => any): this;
	once<E extends keyof BaseConnectorEvents>(event: E, listener: (...args: BaseConnectorEvents[E]) => any): this;
	prependListener<E extends keyof BaseConnectorEvents>(event: E, listener: (...args: BaseConnectorEvents[E]) => any): this;
	prependOnceListener<E extends keyof BaseConnectorEvents>(event: E, listener: (...args: BaseConnectorEvents[E]) => any): this;
	rawListeners(event: keyof BaseConnectorEvents): Array<(...args: Array<any>) => any>;
	removeAllListeners(event?: keyof BaseConnectorEvents): this;
	removeListener<E extends keyof BaseConnectorEvents>(event: E, listener: (...args: BaseConnectorEvents[E]) => any): this;
}

/**
 * BaseConnector class, provides a common structure for connectors
 */
abstract class BaseConnector extends EventEmitter {
	public ready = false;

	/**
	 * Init Method, initializes this connector
	 */
	public abstract initialize(): unknown;
	/**
	 * Called when RainCache finishes processing of an event
	 * @param event received event
	 */
	public abstract send(event: any): unknown;
}

export default BaseConnector;
