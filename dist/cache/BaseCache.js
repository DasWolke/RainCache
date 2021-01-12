"use strict";
class BaseCache {
    constructor(rain) {
        this.boundObject = null;
        this.storageEngine = null;
        this.namespace = "base";
        this.rain = rain;
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
    async addToIndex(id, objectId = this.boundGuild) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.addToList(this.buildId(objectId), id);
    }
    async removeFromIndex(id, objectId = this.boundGuild) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.removeFromList(this.buildId(objectId), id);
    }
    async isIndexed(id, objectId = this.boundGuild) {
        return this.storageEngine.isListMember(this.buildId(objectId), id);
    }
    async getIndexMembers(objectId = this.boundGuild) {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.getListMembers(this.buildId(objectId))) || [];
    }
    async removeIndex(objectId = this.boundGuild) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.removeList(this.buildId(objectId));
    }
    async getIndexCount(objectId = this.boundGuild) {
        return this.storageEngine.getListCount(this.buildId(objectId));
    }
    structurize(data) {
        if (this.namespace === "base")
            throw new Error("Do not call structurize in BaseCache instances. Only extensions.");
        let ns = this.namespace;
        if (this.namespace === "permissionoverwrite")
            ns = "permOverwrite";
        else if (this.namespace === "voicestates")
            ns = "voiceState";
        const structDefs = this.rain.options.structureDefs;
        if (!structDefs)
            throw new Error("Did you delete the structureDefs property from your RainCache instance?");
        const options = structDefs[ns] || { whitelist: [], blacklist: [] };
        const keys = Object.keys(data);
        if (options.whitelist.length) {
            for (const key of keys) {
                if (!options.whitelist.includes(key))
                    delete data[key];
            }
        }
        else {
            if (options.blacklist.length) {
                for (const key of keys) {
                    if (options.blacklist.includes(key))
                        delete data[key];
                }
            }
        }
        return data;
    }
}
module.exports = BaseCache;
