'use strict';
const BaseCache = require('./BaseCache');

class PermissionOverwriteCache extends BaseCache {
    constructor(storageEngine, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = 'permissionoverwrite';
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    async get(id, channelId = this.boundChannel) {
        if (this.boundObject) {
            return this.boundObject;
        }
        let permissionOverwrite = await this.storageEngine.get(this.buildId(id, channelId));
        if (permissionOverwrite) {
            return new PermissionOverwriteCache(this.storageEngine, permissionOverwrite);
        } else {
            return null;
        }
    }

    async update(id, channelId = this.boundChannel, data) {
        if (this.boundObject) {
            this.bindObject(data);
            await this.update(id, channelId, data);
            return this;
        }
        await this.addToIndex(id, channelId);
        await this.storageEngine.upsert(this.buildId(id, channelId), data);
        return new PermissionOverwriteCache(this.storageEngine, this.users, data);
    }

    async remove(id, channelId = this.boundChannel) {
        if (this.boundObject) {
            return this.remove(this.boundObject.id, channelId);
        }
        let permissionOverwrite = await this.storageEngine.get(this.buildId(id, channelId));
        if (permissionOverwrite) {
            await this.removeFromIndex(id, channelId);
            return this.storageEngine.remove(this.buildId(id, channelId));
        } else {
            return null;
        }
    }

    async filter(fn, channelId = this.boundChannel, ids = null) {
        let permissionOverwrites = await this.storageEngine.filter(fn, ids, super.buildId(channelId));
        return permissionOverwrites.map(p => new PermissionOverwriteCache(this.storageEngine, p));
    }

    async find(fn, channelId = this.boundChannel, ids = null) {
        let permissionOverwrite = await this.storageEngine.find(fn, ids, super.buildId(channelId));
        return new PermissionOverwriteCache(this.storageEngine, permissionOverwrite);
    }

    buildId(permissionId, channelId) {
        return `${this.namespace}.${permissionId}.${channelId}`;
    }

    bindChannel(channelId) {
        this.boundChannel = channelId;
        return this;
    }
}

module.exports = PermissionOverwriteCache;