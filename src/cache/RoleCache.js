'use strict';
let BaseCache = require('./BaseCache');

class RoleCache extends BaseCache {
    constructor(storageEngine, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = 'role';
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    async get(id, guildId) {
        if (this.boundObject) {
            return this.boundObject;
        }
        let role = await this.storageEngine.get(this.buildId(id, guildId));
        if (!role) {
            return null;
        }
        return new RoleCache(this.storageEngine, role);
    }

    async update(id, guildId, data) {
        if (this.boundObject) {
            this.bindObject(data);
            await this.update(this.boundObject.id, this.bindObject.guild_id, data);
            return this;
        }
        if (!guildId) {
            return;
        }
        if (!data.guild_id) {
            data.guild_id = guildId;
        }
        if (!data.id) {
            data.id = id;
        }
        await this.storageEngine.upsert(this.buildId(id, guildId), data);
        return new RoleCache(this.storageEngine, data);
    }

    async remove(id, guildId) {
        if (this.boundObject) {
            return this.remove(this.boundObject.id, this.boundObject.guild_id);
        }
        let role = await this.storageEngine.get(this.buildId(id, guildId));
        if (role) {
            return this.storageEngine.remove(this.buildId(id, guildId));
        } else {
            return null;
        }
    }

    buildId(roleId, guildId) {
        return `${this.namespace}.${guildId}.${roleId}`;
    }
}

module.exports = RoleCache;
