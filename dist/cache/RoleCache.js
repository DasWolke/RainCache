"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
class RoleCache extends BaseCache_1.default {
    constructor(storageEngine, rain, boundObject) {
        super(rain);
        this.storageEngine = storageEngine;
        this.namespace = "role";
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    async get(id, guildId) {
        var _a;
        if (this.boundObject) {
            return this;
        }
        const role = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id, guildId)));
        if (!role) {
            return null;
        }
        return new RoleCache(this.storageEngine, this.rain, role);
    }
    async update(id, guildId, data) {
        var _a;
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
        await this.addToIndex(id, guildId);
        await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.upsert(this.buildId(id, guildId), this.structurize(data)));
        if (this.boundObject)
            return this;
        return new RoleCache(this.storageEngine, this.rain, data);
    }
    async remove(id, guildId) {
        var _a, _b;
        const role = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id, guildId)));
        if (role) {
            await this.removeFromIndex(id, guildId);
            return (_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.remove(this.buildId(id, guildId));
        }
        else {
            return undefined;
        }
    }
    async filter(fn, guildId = this.boundGuild, ids = undefined) {
        var _a;
        const roles = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.filter(fn, ids, super.buildId(guildId)));
        if (!roles)
            return [];
        return roles.map(r => new RoleCache(this.storageEngine, this.rain, r));
    }
    async find(fn, guildId = this.boundGuild, ids = undefined) {
        var _a;
        const role = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.find(fn, ids, super.buildId(guildId)));
        if (!role)
            return null;
        return new RoleCache(this.storageEngine, this.rain, role);
    }
    buildId(roleId, guildId) {
        if (!guildId) {
            return super.buildId(roleId);
        }
        return `${this.namespace}.${guildId}.${roleId}`;
    }
}
module.exports = RoleCache;
