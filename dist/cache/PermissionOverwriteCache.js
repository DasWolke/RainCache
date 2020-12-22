"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
class PermissionOverwriteCache extends BaseCache_1.default {
    constructor(storageEngine, rain, boundObject) {
        super(rain);
        this.storageEngine = storageEngine;
        this.namespace = "permissionoverwrite";
        this.boundChannel = "";
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    async get(id, channelId = this.boundChannel) {
        var _a;
        if (this.boundObject) {
            return this;
        }
        const permissionOverwrite = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id, channelId)));
        if (permissionOverwrite) {
            return new PermissionOverwriteCache(this.storageEngine, this.rain, permissionOverwrite);
        }
        else {
            return null;
        }
    }
    async update(id, channelId = this.boundChannel, data) {
        var _a;
        if (this.boundObject) {
            this.bindObject(data);
        }
        await super.addToIndex(id, channelId);
        await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.upsert(this.buildId(id, channelId), this.structurize(data)));
        if (this.boundObject)
            return this;
        return new PermissionOverwriteCache(this.storageEngine, this.rain, data);
    }
    async remove(id, channelId = this.boundChannel) {
        var _a, _b;
        const permissionOverwrite = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id, channelId)));
        if (permissionOverwrite) {
            await super.removeFromIndex(id, channelId);
            return (_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.remove(this.buildId(id, channelId));
        }
        else {
            return undefined;
        }
    }
    async filter(fn, channelId = this.boundChannel, ids = undefined) {
        var _a;
        const permissionOverwrites = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.filter(fn, ids, super.buildId(channelId)));
        if (!permissionOverwrites)
            return [];
        return permissionOverwrites.map(p => new PermissionOverwriteCache(this.storageEngine, this.rain, p));
    }
    async find(fn, channelId = this.boundChannel, ids = undefined) {
        var _a;
        const permissionOverwrite = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.find(fn, ids, super.buildId(channelId)));
        if (!permissionOverwrite)
            return null;
        return new PermissionOverwriteCache(this.storageEngine, this.rain, permissionOverwrite);
    }
    buildId(permissionId, channelId) {
        if (!channelId) {
            return super.buildId(permissionId);
        }
        return `${this.namespace}.${channelId}.${permissionId}`;
    }
    bindChannel(channelId) {
        this.boundChannel = channelId;
        this.boundGuild = channelId;
        return this;
    }
}
module.exports = PermissionOverwriteCache;
