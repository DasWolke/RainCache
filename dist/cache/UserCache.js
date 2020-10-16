"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
class UserCache extends BaseCache_1.default {
    constructor(storageEngine, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = "user";
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    async get(id = this.boundObject?.id) {
        if (this.boundObject) {
            return this;
        }
        const user = await this.storageEngine.get(this.buildId(id));
        if (!user) {
            return null;
        }
        return new UserCache(this.storageEngine, user);
    }
    async update(id = this.boundObject?.id, data) {
        if (this.boundObject) {
            this.bindObject(data);
        }
        await this.addToIndex([id]);
        await this.storageEngine.upsert(this.buildId(id), data);
        if (this.boundObject)
            return this;
        return new UserCache(this.storageEngine, data);
    }
    async remove(id = this.boundObject?.id) {
        const user = await this.storageEngine.get(this.buildId(id));
        if (user) {
            await this.removeFromIndex(id);
            return this.storageEngine.remove(this.buildId(id));
        }
        else {
            return null;
        }
    }
    async filter(fn, ids = null) {
        const users = await this.storageEngine.filter(fn, ids, this.namespace);
        return users.map(u => new UserCache(this.storageEngine, u));
    }
    async find(fn, ids = null) {
        const user = await this.storageEngine.find(fn, ids, this.namespace);
        if (!user)
            return null;
        return new UserCache(this.storageEngine, user);
    }
    bindUserId(userId) {
        this.id = userId;
        return this;
    }
    async addToIndex(ids) {
        return this.storageEngine.addToList(this.namespace, ids);
    }
    async removeFromIndex(id) {
        return this.storageEngine.removeFromList(this.namespace, id);
    }
    async isIndexed(id) {
        return this.storageEngine.isListMember(this.namespace, id);
    }
    async getIndexMembers() {
        return this.storageEngine.getListMembers(this.namespace);
    }
    async removeIndex() {
        return this.storageEngine.removeList(this.namespace);
    }
    async getIndexCount() {
        return this.storageEngine.getListCount(this.namespace);
    }
}
module.exports = UserCache;
