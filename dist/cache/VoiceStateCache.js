"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
class VoiceStateCache extends BaseCache_1.default {
    constructor(storageEngine, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = "voicestates";
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    async get(id, guildId) {
        var _a, _b;
        if (id === void 0) { id = (_a = this.boundObject) === null || _a === void 0 ? void 0 : _a.user_id; }
        if (this.boundObject) {
            return this;
        }
        const state = await ((_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.get(this.buildId(id, guildId)));
        if (!state)
            return null;
        return new VoiceStateCache(this.storageEngine, state);
    }
    async update(id, guildId, data) {
        var _a;
        if (this.boundObject) {
            this.bindObject(data);
        }
        delete data.member;
        await this.addToIndex(id, guildId);
        await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.upsert(this.buildId(id, guildId), data));
        if (this.boundObject)
            return this;
        return new VoiceStateCache(this.storageEngine, data);
    }
    async remove(id, guildId) {
        var _a, _b;
        if (id === void 0) { id = (_a = this.boundObject) === null || _a === void 0 ? void 0 : _a.user_id; }
        const state = await this.get(id, guildId);
        if (state) {
            await this.removeFromIndex(id, guildId);
            return (_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.remove(this.buildId(id, guildId));
        }
        else {
            return undefined;
        }
    }
    async filter(fn, ids = undefined) {
        var _a;
        const states = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.filter(fn, ids, this.namespace));
        if (!states)
            return [];
        return states.map(s => new VoiceStateCache(this.storageEngine, s));
    }
    async find(fn, ids = undefined) {
        var _a;
        const state = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.find(fn, ids, this.namespace));
        if (!state)
            return null;
        return new VoiceStateCache(this.storageEngine, state);
    }
    bindUserId(userId) {
        this.user_id = userId;
        return this;
    }
    async removeFromIndex(id, guildId) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.removeFromList(this.namespace, this.buildId(id, guildId));
    }
    async isIndexed(id, guildId) {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.isListMember(this.namespace, this.buildId(id, guildId))) || false;
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
    buildId(userId, guildId) {
        if (!guildId) {
            return super.buildId(userId);
        }
        return `${this.namespace}.${guildId}.${userId}`;
    }
}
module.exports = VoiceStateCache;
