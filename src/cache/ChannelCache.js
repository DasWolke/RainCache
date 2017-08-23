'use strict';
let BaseCache = require('./BaseCache');

class ChannelCache extends BaseCache {
    constructor(storageEngine, permissionOverwriteCache, userCache, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.storageEngine.updateNamespace('channels.');
        this.permissionOverwrites = permissionOverwriteCache;
        this.recipients = userCache;
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    async get (id) {
        if (this.boundObject) {
            return this.boundObject;
        }
        let channel = await this.storageEngine.get(id);
        if (channel) {
            return new ChannelCache(this.storageEngine, this.permissionOverwrites, this.recipients, channel);
        } else {
            return null;
        }
    }

    async update(id, data) {
        if (this.boundObject) {
            this.bindObject(data); //using bindobject() to assure the data of the class is valid
            await this.update(this.boundObject.id, data);
            return this;
        }
        delete data.permission_overwrites;
        delete data.recipients;
        await this.storageEngine.upsert(id, data);
        let channel = await this.storageEngine.get(id);
        return new ChannelCache(this.storageEngine, this.permissionOverwrites, this.recipients, channel);
    }

    async remove(id) {
        if (this.boundObject) {
            return this.remove(this.boundObject.id);
        }
        let channel = await this.storageEngine.get(id);
        if (channel) {
            return this.storageEngine.remove(id);
        } else {
            return null;
        }
    }

    async filter(fn, channelMap) {
        let channels = await this.storageEngine.filter(fn, channelMap);
        return channels.map(c => new ChannelCache(this.storageEngine, this.permissionOverwrites, this.recipients, c));
    }

    bindNamespace(namespace) {
        this.storageEngine.updateNamespace(namespace);
    }
}

module.exports = ChannelCache;
