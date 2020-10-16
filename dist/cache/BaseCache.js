"use strict";
class BaseCache {
    constructor() {
        this.boundObject = null;
        this.storageEngine = null;
        this.namespace = "base";
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
    async addToIndex(ids, objectId = this.boundGuild) {
        return this.storageEngine?.addToList(this.buildId(objectId), ids);
    }
    async removeFromIndex(id, objectId = this.boundGuild) {
        return this.storageEngine?.removeFromList(this.buildId(objectId), id);
    }
    async isIndexed(id, objectId = this.boundGuild) {
        return this.storageEngine.isListMember(this.buildId(objectId), id);
    }
    async getIndexMembers(objectId = this.boundGuild) {
        return this.storageEngine?.getListMembers(this.buildId(objectId));
    }
    async removeIndex(objectId = this.boundGuild) {
        return this.storageEngine?.removeList(this.buildId(objectId));
    }
    async getIndexCount(objectId = this.boundGuild) {
        return this.storageEngine.getListCount(this.buildId(objectId));
    }
}
module.exports = BaseCache;
