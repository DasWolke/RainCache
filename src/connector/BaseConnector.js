const EventEmitter = require("events").EventEmitter;

/**
 * BaseConnector class, provides a common structure for connectors
 */
class BaseConnector extends EventEmitter {
	constructor() {
		super();
		this.ready = false;
	}
	initialize() {
		this.ready = true;
		return Promise.resolve();
	}
	// eslint-disable-next-line no-unused-vars
	send(event) {}
}

module.exports = BaseConnector;
