import { EventEmitter } from "events";

/**
 * BaseConnector class, provides a common structure for connectors
 */
class BaseConnector extends EventEmitter {
	public ready = false;

	public constructor() {
		super();
	}

	public initialize() {
		this.ready = true;
		return Promise.resolve();
	}

	public send(event: any) { void event; }
}

export = BaseConnector;
