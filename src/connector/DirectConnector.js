'use strict';
let BaseConnector = require('./BaseConnector');

class DirectConnector extends BaseConnector {
    constructor(options) {
        super();
        this.options = options || {};
        this.client = null;
        this.ready = false;
    }

    async initialize() {
        this.ready = true;
        return Promise.resolve();
    }
}

module.exports = DirectConnector;
