'use strict';
const BaseCache = require('./BaseCache');

class MemberCache extends BaseCache {
    constructor(storageEngine, userCache, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = 'member';
        this.user = userCache;
        this.boundGuild = '';
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    async get(id, guildId = this.boundGuild) {
        let user = await this.user.get(id);
        if (this.boundObject) {
            this.boundObject.user = user;
            return this.boundObject;
        }
        let member = await this.storageEngine.get(this.buildId(id, guildId));
        if (!member) {
            return null;
        }
        member.user = user;
        return new MemberCache(this.storageEngine, this.user.bindUserId(member.id), member);
    }

    async update(id, guildId = this.boundGuild, data) {
        if (this.boundObject) {
            this.bindObject(data);
            await this.update(this.boundObject.id, this.boundObject.guild_id, data);
            return this;
        }
        if (!guildId) {
            console.error(`Empty guild id for member ${id}`);
            return;
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
        await this.storageEngine.upsert(this.buildId(id, guildId), data);
        return new MemberCache(this.storageEngine, this.user.bindUserId(data.id), data);
    }

    async remove(id, guildId = this.boundGuild) {
        if (this.boundObject) {
            return this.remove(this.boundObject.id, this.boundObject.guild_id);
        }
        let member = await this.storageEngine.get(this.buildId(id, guildId));
        if (member) {
            await this.storageEngine.removeFromIndex(id, guildId);
            return this.storageEngine.remove(this.buildId(id, guildId));
        } else {
            return null;
        }
    }

    async filter(fn, guildId = this.boundGuild, ids = null) {
        let members = await this.storageEngine.filter(fn, ids, super.buildId(guildId));
        return members.map(m => new MemberCache(this.storageEngine, this.user.bindUserId(m.id), m).bindGuild(this.boundGuild));
    }

    async find(fn, guildId = this.boundGuild, ids = null) {
        let member = await this.storageEngine.find(fn, ids, super.buildId(guildId));
        return new MemberCache(this.storageEngine, this.user.bindUserId(member.id), member);
    }

    buildId(userId, guildId) {
        return `${this.namespace}.${guildId}.${userId}`;
    }

}

module.exports = MemberCache;
