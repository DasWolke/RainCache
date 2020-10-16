"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
class EmojiCache extends BaseCache_1.default {
    constructor(storageEngine, boundObject) {
        super();
        this.namespace = "emoji";
        this.storageEngine = storageEngine;
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    async get(id, guildId = this.boundGuild) {
        if (this.boundObject) {
            return this;
        }
        const emoji = await this.storageEngine.get(this.buildId(id, guildId));
        if (emoji) {
            return new EmojiCache(this.storageEngine, emoji);
        }
        else {
            return null;
        }
    }
    async update(id, guildId = this.boundGuild, data) {
        if (this.boundObject) {
            this.bindObject(data);
        }
        await this.addToIndex([id], guildId);
        await this.storageEngine.upsert(this.buildId(id, guildId), data);
        if (this.boundObject)
            return this;
        return new EmojiCache(this.storageEngine, data);
    }
    async remove(id, guildId = this.boundGuild) {
        const emoji = await this.storageEngine.get(this.buildId(id, guildId));
        if (emoji) {
            await this.removeFromIndex(id, guildId);
            return this.storageEngine.remove(this.buildId(id, guildId));
        }
        else {
            return null;
        }
    }
    async filter(fn, guildId = this.boundGuild, ids = null) {
        const emojis = await this.storageEngine.filter(fn, ids, super.buildId(guildId));
        return emojis.map(e => new EmojiCache(this.storageEngine, e));
    }
    async find(fn, guildId = this.boundGuild, ids = null) {
        const emoji = await this.storageEngine.find(fn, ids, super.buildId(guildId));
        if (!emoji)
            return null;
        return new EmojiCache(this.storageEngine, emoji);
    }
    buildId(emojiId, guildId) {
        if (!guildId) {
            return super.buildId(emojiId);
        }
        return `${this.namespace}.${guildId}.${emojiId}`;
    }
}
module.exports = EmojiCache;
