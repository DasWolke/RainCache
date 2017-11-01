'use strict';

class BaseCache {
    constructor() {
        this.storageEngine = null;
        this.namespace = 'base';
    }

    bindObject(boundObject) {
        this.dataTimestamp = new Date();
        this.boundObject = boundObject;
        Object.assign(this, boundObject);
    }

    bindGuild(guildId) {
        this.boundGuild = guildId;
        return this;
    }

    buildId(id) {
        return `${this.namespace}.${id}`;
    }

    async addToIndex(id, guildId = this.boundGuild) {
        return this.storageEngine.addToList(this.buildId(guildId), id);
    }

    async removeFromIndex(id, guildId = this.boundGuild) {
        return this.storageEngine.removeFromList(this.buildId(guildId), id);
    }

    async isIndexed(id, guildId = this.boundGuild) {
        return this.storageEngine.isListMember(this.buildId(id, guildId));
    }

    async getIndexMembers(guildId = this.boundGuild) {
        return this.storageEngine.getListMembers(this.buildId(guildId));
    }

    async removeIndex(guildId = this.boundGuild) {
        return this.storageEngine.removeList(this.buildId(guildId));
    }

    async getIndexCount(guildId = this.boundGuild) {
        return this.storageEngine.getListCount(this.buildId(guildId));
    }
}

module.exports = BaseCache;
