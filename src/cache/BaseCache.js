'use strict';

class BaseCache {
    bindObject(boundObject) {
        this.dataTimestamp = new Date();
        this.boundObject = boundObject;
        Object.assign(this, boundObject);
    }
}

module.exports = BaseCache;
