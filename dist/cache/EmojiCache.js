"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
class EmojiCache extends BaseCache_1.default {
    constructor(storageEngine, rain, boundObject) {
        super(rain);
        this.namespace = "emoji";
        this.storageEngine = storageEngine;
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    async get(id, guildId = this.boundGuild) {
        var _a;
        if (this.boundObject) {
            return this;
        }
        const emoji = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id, guildId)));
        if (emoji) {
            return new EmojiCache(this.storageEngine, this.rain, emoji);
        }
        else {
            return null;
        }
    }
    async update(id, guildId = this.boundGuild, data) {
        var _a;
        if (this.boundObject) {
            this.bindObject(data);
        }
        await this.addToIndex(id, guildId);
        await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.upsert(this.buildId(id, guildId), this.structurize(data)));
        if (this.boundObject)
            return this;
        return new EmojiCache(this.storageEngine, this.rain, data);
    }
    async remove(id, guildId = this.boundGuild) {
        var _a, _b;
        const emoji = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id, guildId)));
        if (emoji) {
            await this.removeFromIndex(id, guildId);
            return (_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.remove(this.buildId(id, guildId));
        }
        else {
            return undefined;
        }
    }
    async filter(fn, guildId, ids) {
        var _a;
        if (!guildId && this.boundGuild)
            guildId = this.boundGuild;
        const emojis = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.filter(fn, ids, super.buildId(guildId)));
        if (!emojis)
            return [];
        return emojis.map(e => new EmojiCache(this.storageEngine, this.rain, e));
    }
    async find(fn, guildId, ids) {
        var _a;
        if (!guildId && this.boundGuild)
            guildId = this.boundGuild;
        const emoji = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.find(fn, ids, super.buildId(guildId)));
        if (!emoji)
            return null;
        return new EmojiCache(this.storageEngine, this.rain, emoji);
    }
    buildId(emojiId, guildId) {
        if (!guildId) {
            return super.buildId(emojiId);
        }
        return `${this.namespace}.${guildId}.${emojiId}`;
    }
}
module.exports = EmojiCache;
