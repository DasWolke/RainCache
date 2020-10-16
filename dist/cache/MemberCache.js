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
        if (this.boundObject) {
            return this;
        }
        const member = await this.storageEngine.get(this.buildId(id, guildId));
        if (!member) {
            return null;
        }
        return new MemberCache(this.storageEngine, this.user.bindUserId(member.id), member);
    }
    async update(id, guildId = this.boundGuild, data) {
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
        await this.addToIndex([id], guildId);
        await this.storageEngine.upsert(this.buildId(id, guildId), data);
        if (this.boundObject)
            return this;
        return new MemberCache(this.storageEngine, this.user.bindUserId(data.id), data);
    }
    async remove(id, guildId = this.boundGuild) {
        const member = await this.storageEngine.get(this.buildId(id, guildId));
        if (member) {
            await this.removeFromIndex(id, guildId);
            return this.storageEngine.remove(this.buildId(id, guildId));
        }
        else {
            return null;
        }
    }
    async filter(fn, guildId = this.boundGuild, ids = null) {
        const members = await this.storageEngine.filter(fn, ids, super.buildId(guildId));
        return members.map(m => new MemberCache(this.storageEngine, this.user.bindUserId(m.id), m).bindGuild(this.boundGuild));
    }
    async find(fn, guildId = this.boundGuild, ids = null) {
        const member = await this.storageEngine.find(fn, ids, super.buildId(guildId));
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
