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

    bindGuild(guildId) {
        this.boundGuild = guildId;
        return this;
    }

    buildId(id) {
        return `${this.namespace}.${id}`;
    }
}

module.exports = BaseCache;
