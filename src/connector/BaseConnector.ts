import { EventEmitter } from "events";

/**
 * BaseConnector class, provides a common structure for connectors
 */
class BaseConnector extends EventEmitter {
	public ready: boolean;

	public constructor() {
		super();
		this.ready = false;
	}

	public initialize() {
		this.ready = true;
		return Promise.resolve();
	}

	public send(event: any) { void event; }
}

export = BaseConnector;
