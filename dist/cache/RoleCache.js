"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
class RoleCache extends BaseCache_1.default {
    constructor(storageEngine, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = "role";
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    async get(id, guildId) {
        if (this.boundObject) {
            return this;
        }
        const role = await this.storageEngine.get(this.buildId(id, guildId));
        if (!role) {
            return null;
        }
        return new RoleCache(this.storageEngine, role);
    }
    async update(id, guildId, data) {
        if (this.boundObject) {
            this.bindObject(data);
        }
        if (!guildId) {
            return Promise.reject("Missing guild id");
        }
        if (!data.guild_id) {
            data.guild_id = guildId;
        }
        if (!data.id) {
            data.id = id;
        }
        await this.addToIndex([id], guildId);
        await this.storageEngine.upsert(this.buildId(id, guildId), data);
        if (this.boundObject)
            return this;
        return new RoleCache(this.storageEngine, data);
    }
    async remove(id, guildId) {
        const role = await this.storageEngine.get(this.buildId(id, guildId));
        if (role) {
            await this.removeFromIndex(id, guildId);
            return this.storageEngine.remove(this.buildId(id, guildId));
        }
        else {
            return null;
        }
    }
    async filter(fn, guildId = this.boundGuild, ids = null) {
        const roles = await this.storageEngine.filter(fn, ids, super.buildId(guildId));
        return roles.map(r => new RoleCache(this.storageEngine, r));
    }
    async find(fn, guildId = this.boundGuild, ids = null) {
        const role = await this.storageEngine.find(fn, ids, super.buildId(guildId));
        if (!role)
            return null;
        return new RoleCache(this.storageEngine, role);
    }
    buildId(roleId, guildId) {
        if (!guildId) {
            return super.buildId(roleId);
        }
        return `${this.namespace}.${guildId}.${roleId}`;
    }
}
module.exports = RoleCache;
