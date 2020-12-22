"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
class PresenceCache extends BaseCache_1.default {
    constructor(storageEngine, userCache, rain, boundObject) {
        super(rain);
        this.storageEngine = storageEngine;
        this.namespace = "presence";
        this.users = userCache;
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    async get(id) {
        var _a;
        if (this.boundObject) {
            return this;
        }
        const presence = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id)));
        if (presence) {
            return new PresenceCache(this.storageEngine, this.users.bindUserId(id), this.rain, presence);
        }
        else {
            return null;
        }
    }
    async update(id, data) {
        var _a;
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
        await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.upsert(this.buildId(id), this.structurize(data)));
        if (this.boundObject)
            return this;
        return new PresenceCache(this.storageEngine, this.users, this.rain, data);
    }
    async remove(id) {
        var _a, _b;
        const presence = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id)));
        if (presence) {
            return (_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.remove(this.buildId(id));
        }
        else {
            return undefined;
        }
    }
}
module.exports = PresenceCache;
