"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
/**
 * Cache responsible for caching users
 * @extends BaseCache
 */
class UserCache extends BaseCache_1.default {
    /**
     * Create a new UserCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param storageEngine Storage engine to use for this cache
     * @param boundObject Optional, may be used to bind a user object to the cache
     */
    constructor(storageEngine, rain, boundObject) {
        super(rain);
        this.storageEngine = storageEngine;
        this.namespace = "user";
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }
    /**
     * Loads a user from the cache via id
     * @param id discord id of the user
     * @returns Returns a User Cache with a bound user or null if no user was found
     */
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
    /**
     * Update a user entry in the cache
     * @param id discord id of the user
     * @param data updated data of the user, it will be merged with the old data
     */
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
    /**
     * Remove a user from the cache
     * @param id discord id of the user
     */
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
    /**
     * Filter for users by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for the filtering
     * @param ids Array of user ids, if omitted the global user index will be used
     */
    async filter(fn, ids = undefined) {
        var _a;
        const users = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.filter(fn, ids, this.namespace));
        if (!users)
            return [];
        return users.map(u => new UserCache(this.storageEngine, this.rain, u));
    }
    /**
     * Find a user by providing a filter function which returns true upon success and false otherwise
     * @param fn filter function to use for filtering for a user
     * @param ids List of ids that should be used as the scope of the filter
     * @returns Returns a User Cache with a bound user or null if no user was found
     */
    async find(fn, ids = undefined) {
        var _a;
        const user = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.find(fn, ids, this.namespace));
        if (!user)
            return null;
        return new UserCache(this.storageEngine, this.rain, user);
    }
    /**
     * Bind a user id to the cache, used by the member cache
     * @param userId id of the user
     * @returns Returns a UserCache that has an id bound to it, which serves as the default argument to get, update and delete
     */
    bindUserId(userId) {
        // @ts-ignore
        this.id = userId;
        return this;
    }
    /**
     * Add users to the index
     * @param id ids of the users
     */
    async addToIndex(id) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.addToList(this.namespace, id);
    }
    /**
     * Remove a user from the index
     * @param id id of the user
     */
    async removeFromIndex(id) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.removeFromList(this.namespace, id);
    }
    /**
     * Check if a user is indexed
     * @paramid id of the user
     * @returns True if the user is indexed, false otherwise
     */
    async isIndexed(id) {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.isListMember(this.namespace, id)) || false;
    }
    /**
     * Get a list of currently indexed users, since users is a global namespace,
     * this will return **ALL** users that the bot cached currently
     * @returns Array with a list of ids of users that are indexed
     */
    async getIndexMembers() {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.getListMembers(this.namespace)) || [];
    }
    /**
     * Delete the user index, you should probably **not** use this function, but I won't stop you.
     */
    async removeIndex() {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.removeList(this.namespace);
    }
    /**
     * Get the number of users that are currently cached
     * @returns Number of users currently cached
     */
    async getIndexCount() {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.getListCount(this.namespace)) || 0;
    }
}
module.exports = UserCache;
