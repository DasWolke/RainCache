import BaseConnector from "./BaseConnector";

/**
 * Direct Connector, useful when using raincache with an existing solution library that runs in the same process
 */
class DirectConnector extends BaseConnector {
	/**
	 * Init Method, initializes this connector
	 */
	public initialize(): void {
		this.ready = true;
	}

	/**
	 * Called when RainCache finishes processing of an event
	 * @param event received event
	 */
	public send(event: any): void {
		/**
		 * @event DirectConnector#send
		 * @description Emitted once an event was fully processed by RainCache, you can now forward that event somewhere else
		 */
		this.emit("send", event);
	}
}

export default DirectConnector;
