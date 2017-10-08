'use strict';
let BaseCache = require('./BaseCache');

//TODO add permission overwrites and recipients
class ChannelCache extends BaseCache {
    constructor(storageEngine, channelMap, permissionOverwriteCache, userCache, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = 'channel';
        this.channelMap = channelMap;
        this.permissionOverwrites = permissionOverwriteCache;
        this.recipients = userCache;
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    async get(id) {
        if (this.boundObject) {
            return this.boundObject;
        }
        let channel = await this.storageEngine.get(this.buildId(id));
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
        if (data.guild_id) {
            await this.channelMap.update(data.guild_id, [data.id]);
        } else if (data.recipients) {
            if (data.recipients[0]) {
                await this.channelMap.update(data.recipients[0].id, [data.id], 'user');
            }
        }
        delete data.permission_overwrites;
        delete data.recipients;
        await this.addToIndex(id);
        await this.storageEngine.upsert(this.buildId(id), data);
        let channel = await this.storageEngine.get(this.buildId(id));
        return new ChannelCache(this.storageEngine, this.permissionOverwrites, this.recipients, channel);
    }

    async remove(id) {
        if (this.boundObject) {
            return this.remove(this.boundObject.id);
        }
        let channel = await this.storageEngine.get(this.buildId(id));
        if (channel) {
            await this.removeFromIndex(id);
            return this.storageEngine.remove(this.buildId(id));
        } else {
            return null;
        }
    }

    async filter(fn, channelMap) {
        let channels = await this.storageEngine.filter(fn, channelMap, this.namespace);
        return channels.map(c => new ChannelCache(this.storageEngine, this.permissionOverwrites, this.recipients, c));
    }

    async find(fn, channelMap) {
        let channel = await this.storageEngine.find(fn, channelMap, this.namespace);
        return new ChannelCache(this.storageEngine, this.permissionOverwrites, this.recipients, channel);
    }

    async addToIndex(id) {
        return this.storageEngine.addToList(this.namespace, id);
    }

    async removeFromIndex(id) {
        return this.storageEngine.removeFromList(this.namespace, id);
    }

    async isIndexed(id) {
        return this.storageEngine.isListMember(this.namespace, id);
    }

    async getIndexMembers() {
        return this.storageEngine.getListMembers(this.namespace);
    }

    async removeIndex() {
        return this.storageEngine.removeList(this.namespace);
    }
}

module.exports = ChannelCache;
