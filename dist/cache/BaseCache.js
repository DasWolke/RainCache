"use strict";
class _BaseCache {
    /**
     * Base class for all cache classes.
     *
     * You should **not** create BaseCache by itself, but instead create a class that extends from it.
     *
     * **All Methods from BaseCache are also available on every class that is extending it.**
     */
    constructor(rain) {
        this.boundObject = null;
        this.storageEngine = null;
        this.namespace = "base";
        this.rain = rain;
    }
    /**
     * Bind an object to the cache instance, you can read more on binding on the landing page of the documentation
     * @param boundObject - Object to bind to this cache instance
     */
    bindObject(boundObject) {
        this.dataTimestamp = new Date();
        this.boundObject = boundObject;
        Object.assign(this, boundObject);
    }
    /**
     * Bind a guild id to the cache
     * @param guildId id of the guild that should be bound to this cache
     */
    bindGuild(guildId) {
        this.boundGuild = guildId;
        return this;
    }
    /**
     * Build an id consisting of $namespace.$id
     * @param id id to append to namespace
     * @returns constructed id
     */
    buildId(id) {
        return `${this.namespace}.${id}`;
    }
    /**
     * Add ids to the index of a namespace
     * @param id ids to add
     * @param objectId id of the parent object of the index
     */
    async addToIndex(id, objectId = this.boundGuild) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.addToList(this.buildId(objectId), id);
    }
    /**
     * Remove an id from the index
     * @param id id to be removed
     * @param objectId id of the parent object of the index
     */
    async removeFromIndex(id, objectId = this.boundGuild) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.removeFromList(this.buildId(objectId), id);
    }
    /**
     * Check if an id is a member of an index
     * @param id id to check
     * @param objectId id of the parent object of the index
     * @returns returns true if it is a part of the index, false otherwise
     */
    async isIndexed(id, objectId = this.boundGuild) {
        return this.storageEngine.isListMember(this.buildId(objectId), id);
    }
    /**
     * Get all members from an index
     * @param objectId id of the parent object of the index
     */
    async getIndexMembers(objectId = this.boundGuild) {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.getListMembers(this.buildId(objectId))) || [];
    }
    /**
     * Delete an index
     * @param objectId id of the parent object of the index
     */
    async removeIndex(objectId = this.boundGuild) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.removeList(this.buildId(objectId));
    }
    /**
     * Get the number of elements that are within an index
     * @param objectId id of the parent object of the index
     */
    async getIndexCount(objectId = this.boundGuild) {
        return this.storageEngine.getListCount(this.buildId(objectId));
    }
    /**
     * Delete keys from data if necessary based on RainCache structureDefs options and return the cleaned data
     * @param data The data to possibly delete object entries from
     */
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
_BaseCache.default = _BaseCache;
const BaseCacheWithProperTypes = _BaseCache;
module.exports = BaseCacheWithProperTypes;
