'use strict';
const BaseCache = require('./BaseCache');

/**
 * @property {StorageEngine} storageEngine - Storage engine to use for this cache
 * @property {String} namespace=user - namespace of the cache
 * @extends BaseCache
 */
class PermissionOverwriteCache extends BaseCache {
    constructor(storageEngine, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = 'permissionoverwrite';
        this.boundChannel = '';
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
        await super.addToIndex(id, channelId);
        await this.storageEngine.upsert(this.buildId(id, channelId), data);
        return new PermissionOverwriteCache(this.storageEngine, data);
    }

    async remove(id, channelId = this.boundChannel) {
        if (this.boundObject) {
            return this.remove(this.boundObject.id, channelId);
        }
        let permissionOverwrite = await this.storageEngine.get(this.buildId(id, channelId));
        if (permissionOverwrite) {
            await super.removeFromIndex(id, channelId);
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
        if (!channelId) {
            return super.buildId(permissionId);
        }
        return `${this.namespace}.${channelId}.${permissionId}`;
    }

    bindChannel(channelId) {
        this.boundChannel = channelId;
        this.boundGuild = channelId;
        return this;
    }
}

module.exports = PermissionOverwriteCache;