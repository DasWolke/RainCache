"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
class PresenceCache extends BaseCache_1.default {
    constructor(storageEngine, userCache, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = "presence";
        this.users = userCache;
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    async get(id) {
        if (this.boundObject) {
            return this;
        }
        const presence = await this.storageEngine.get(this.buildId(id));
        if (presence) {
            return new PresenceCache(this.storageEngine, this.users.bindUserId(id), presence);
        }
        else {
            return null;
        }
    }
    async update(id, data) {
        if (this.boundObject) {
            this.bindObject(data);
        }
        if (data.guild_id) {
            delete data.guild_id;
        }
        if (data.roles) {
            delete data.roles;
        }
        if (data.user) {
            await this.users.update(data.user.id, data.user);
            delete data.user;
        }
        await this.storageEngine.upsert(this.buildId(id), data);
        if (this.boundObject)
            return this;
        return new PresenceCache(this.storageEngine, this.users, data);
    }
    async remove(id) {
        const presence = await this.storageEngine.get(this.buildId(id));
        if (presence) {
            return this.storageEngine.remove(this.buildId(id));
        }
        else {
            return null;
        }
    }
}
module.exports = PresenceCache;
