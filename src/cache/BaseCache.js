'use strict';

class BaseCache {
    constructor() {
        this.namespace = 'base';
    }
    bindObject(boundObject) {
        this.dataTimestamp = new Date();
        this.boundObject = boundObject;
        Object.assign(this, boundObject);
    }

    buildId(id) {
        return `${this.namespace}.${id}`;
    }
}

module.exports = BaseCache;
