import BaseConnector from "./BaseConnector";

/**
 * Direct Connector, useful when using raincache with an existing solution library that runs in the same process
 */
class DirectConnector extends BaseConnector {
	/**
	 * Create a new Direct Connector
	 */
	constructor() {
		super();
		this.ready = false;
	}

	/**
	 * Init Method, initializes this connector
	 */
	initialize(): Promise<null> {
		this.ready = true;
		return Promise.resolve(null);
	}

	/**
	 * Forward a discord event to RainCache
	 * @param event received event
	 */
	receive(event: any) {
		this.emit("event", event);
	}

	/**
	 * Called when RainCache finishes processing of an event
	 * @param event received event
	 */
	send(event: any) {
		/**
		 * @event DirectConnector#send
		 * @description Emitted once an event was fully processed by RainCache, you can now forward that event somewhere else
		 */
		this.emit("send", event);
	}
}

export = DirectConnector;
