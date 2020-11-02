"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
class MemberCache extends BaseCache_1.default {
    constructor(storageEngine, userCache, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = "member";
        this.user = userCache;
        this.boundGuild = "";
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    async get(id, guildId = this.boundGuild) {
        var _a;
        if (this.boundObject) {
            return this;
        }
        const member = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id, guildId)));
        if (!member) {
            return null;
        }
        return new MemberCache(this.storageEngine, this.user.bindUserId(member.id), member);
    }
    async update(id, guildId = this.boundGuild, data) {
        var _a;
        if (this.boundObject) {
            this.bindObject(data);
        }
        if (!guildId) {
            throw new Error(`Empty guild id for member ${id}`);
        }
        if (!data.guild_id) {
            data.guild_id = guildId;
        }
        if (!data.id) {
            data.id = id;
        }
        if (data.user) {
            await this.user.update(data.user.id, data.user);
            delete data.user;
        }
        await this.addToIndex(id, guildId);
        await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.upsert(this.buildId(id, guildId), data));
        if (this.boundObject)
            return this;
        return new MemberCache(this.storageEngine, this.user.bindUserId(data.id), data);
    }
    async remove(id, guildId = this.boundGuild) {
        var _a, _b;
        const member = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id, guildId)));
        if (member) {
            await this.removeFromIndex(id, guildId);
            return (_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.remove(this.buildId(id, guildId));
        }
        else {
            return undefined;
        }
    }
    async filter(fn, guildId = this.boundGuild, ids) {
        var _a;
        const members = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.filter(fn, ids, super.buildId(guildId)));
        return members.map(m => new MemberCache(this.storageEngine, this.user.bindUserId(m.id), m).bindGuild(this.boundGuild));
    }
    async find(fn, guildId = this.boundGuild, ids = undefined) {
        var _a;
        const member = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.find(fn, ids, super.buildId(guildId)));
        if (!member)
            return null;
        return new MemberCache(this.storageEngine, this.user.bindUserId(member.id), member);
    }
    buildId(userId, guildId) {
        if (!guildId) {
            return super.buildId(userId);
        }
        return `${this.namespace}.${guildId}.${userId}`;
    }
}
module.exports = MemberCache;
