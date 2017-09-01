'use strict';
const BaseCache = require('./BaseCache');

class MemberCache extends BaseCache {
    constructor(storageEngine, userCache, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = 'member';
        this.users = userCache;
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    async get (id, guildId) {
        let user = await this.users.get(id);
        if (this.boundObject) {
            this.boundObject.user = user;
            return this.boundObject;
        }
        let member = await this.storageEngine.get(this.buildId(id, guildId));
        if (!member) {
            return null;
        }
        member.user = user;
        return new MemberCache(this.storageEngine, this.users, member);
    }

    async update(id, guildId, data) {
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
            // await this.users.update(data.user.id, data.user);
            delete data.user;
        }
        await this.storageEngine.upsert(this.buildId(id, guildId), data);
        return new MemberCache(this.storageEngine, this.users, data);
    }

    async remove(id, guildId) {
        if (this.boundObject) {
            return this.remove(this.boundObject.id, this.boundObject.guild_id);
        }
        let member = await this.storageEngine.get(this.buildId(id, guildId));
        if (member) {
            return this.storageEngine.remove(this.buildId(id, guildId));
        } else {
            return null;
        }
    }

    buildId(userId, guildId) {
        return `${this.namespace}.${guildId}.${userId}`;
    }
}

module.exports = MemberCache;
