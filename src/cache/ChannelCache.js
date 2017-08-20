'use strict';
let BaseCache = require('./BaseCache');

class ChannelCache extends BaseCache {
    constructor(storageEngine, permissionOverwriteCache, userCache, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.permissionOverwrites = permissionOverwriteCache;
        this.recipients = userCache;
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
}

module.exports = ChannelCache;
