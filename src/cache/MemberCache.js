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
        let member = await this.storageEngine.get(this.buildId(id));
        if (!member) {
            return null;
        }
        member.user = user;
        return new MemberCache(this.storageEngine, this.users, member);
    }

    async update(id, guildId, data) {

    }

    async remove(id, guildId) {

    }

    buildId(userId, guildId) {
        return `${this.namespace}.${guildId}.${userId}`;
    }
}

module.exports = MemberCache;
