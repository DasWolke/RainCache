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
    async get(id = this.boundObject?.user_id, guildId) {
        if (this.boundObject) {
            return this;
        }
        const state = await this.storageEngine.get(this.buildId(id, guildId));
        if (!state) {
            return null;
        }
        return new VoiceStateCache(this.storageEngine, state);
    }
    async update(id, guildId, data) {
        if (this.boundObject) {
            this.bindObject(data);
        }
        delete data.member;
        await this.addToIndex([id]);
        await this.storageEngine.upsert(this.buildId(id, guildId), data);
        if (this.boundObject)
            return this;
        return new VoiceStateCache(this.storageEngine, data);
    }
    async remove(id = this.boundObject?.user_id, guildId) {
        const state = await this.isIndexed(id, guildId);
        if (state) {
            await this.removeFromIndex(id, guildId);
            return this.storageEngine.remove(this.buildId(id, guildId));
        }
        else {
            return null;
        }
    }
    async filter(fn, ids = null) {
        const states = await this.storageEngine.filter(fn, ids, this.namespace);
        return states.map(s => new VoiceStateCache(this.storageEngine, s));
    }
    async find(fn, ids = null) {
        const state = await this.storageEngine.find(fn, ids, this.namespace);
        if (!state)
            return null;
        return new VoiceStateCache(this.storageEngine, state);
    }
    bindUserId(userId) {
        this.user_id = userId;
        return this;
    }
    async removeFromIndex(id, guildId) {
        return this.storageEngine.removeFromList(this.namespace, this.buildId(id, guildId));
    }
    async isIndexed(id, guildId) {
        return this.storageEngine.isListMember(this.namespace, this.buildId(id, guildId));
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
    buildId(userId, guildId) {
        if (!guildId) {
            return super.buildId(userId);
        }
        return `${this.namespace}.${guildId}.${userId}`;
    }
}
module.exports = VoiceStateCache;
