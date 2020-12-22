"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
class UserCache extends BaseCache_1.default {
    constructor(storageEngine, rain, boundObject) {
        super(rain);
        this.storageEngine = storageEngine;
        this.namespace = "user";
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    async get(id = (_a = this.boundObject) === null || _a === void 0 ? void 0 : _a.id) {
        var _a, _b;
        if (this.boundObject) {
            return this;
        }
        const user = await ((_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.get(this.buildId(id)));
        if (!user) {
            return null;
        }
        return new UserCache(this.storageEngine, this.rain, user);
    }
    async update(id = (_a = this.boundObject) === null || _a === void 0 ? void 0 : _a.id, data) {
        var _a, _b;
        if (this.boundObject) {
            this.bindObject(data);
        }
        await this.addToIndex(id);
        await ((_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.upsert(this.buildId(id), this.structurize(data)));
        if (this.boundObject)
            return this;
        return new UserCache(this.storageEngine, this.rain, data);
    }
    async remove(id = (_a = this.boundObject) === null || _a === void 0 ? void 0 : _a.id) {
        var _a, _b, _c;
        const user = await ((_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.get(this.buildId(id)));
        if (user) {
            await this.removeFromIndex(id);
            return (_c = this.storageEngine) === null || _c === void 0 ? void 0 : _c.remove(this.buildId(id));
        }
        else {
            return undefined;
        }
    }
    async filter(fn, ids = undefined) {
        var _a;
        const users = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.filter(fn, ids, this.namespace));
        if (!users)
            return [];
        return users.map(u => new UserCache(this.storageEngine, this.rain, u));
    }
    async find(fn, ids = undefined) {
        var _a;
        const user = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.find(fn, ids, this.namespace));
        if (!user)
            return null;
        return new UserCache(this.storageEngine, this.rain, user);
    }
    bindUserId(userId) {
        this.id = userId;
        return this;
    }
    async addToIndex(id) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.addToList(this.namespace, id);
    }
    async removeFromIndex(id) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.removeFromList(this.namespace, id);
    }
    async isIndexed(id) {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.isListMember(this.namespace, id)) || false;
    }
    async getIndexMembers() {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.getListMembers(this.namespace)) || [];
    }
    async removeIndex() {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.removeList(this.namespace);
    }
    async getIndexCount() {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.getListCount(this.namespace)) || 0;
    }
}
module.exports = UserCache;
