'use strict';
/**
 * Base class for all cache classes.
 */
class BaseCache {
    /**
     * You should **not** create BaseCache by itself, but instead create a class that extends from it.
     *
     * **All Methods from BaseCache are also available on every class that is extending it.**
     * @property {BaseStorageEngine} storageEngine - storage engine of the cache
     * @property {String} namespace=base - namespace of the cache
     * @property {String} [boundGuild] - guild id bound to this cache
     */
    constructor() {
        this.storageEngine = null;
        this.namespace = 'base';
    }

    /**
     * Bind an object to the cache instance, you can read more on binding on the landing page of the documentation
     * @param {Object} boundObject - Object to bind to this cache instance
     */
    bindObject(boundObject) {
        this.dataTimestamp = new Date();
        this.boundObject = boundObject;
        Object.assign(this, boundObject);
    }

    /**
     * Bind a guild id to the cache
     * @param {String} guildId - id of the guild that should be bound to this cache
     * @return {BaseCache}
     * @public
     */
    bindGuild(guildId) {
        this.boundGuild = guildId;
        return this;
    }

    /**
     * Build an id consisting of $namespace.$id
     * @param {String} id - id to append to namespace
     * @return {String} - constructed id
     */
    buildId(id) {
        return `${this.namespace}.${id}`;
    }

    /**
     * Add an id to the index of a namespace
     * @param {String|String[]} id - id to add
     * @param {String} [objectId=this.boundGuild] - id of the parent object of the index
     * @return {Promise.<void>}
     */
    async addToIndex(id, objectId = this.boundGuild) {
        return this.storageEngine.addToList(this.buildId(objectId), id);
    }

    /**
     * Remove an id from the index
     * @param {String|String[]} id - id to be removed
     * @param {String} [objectId=this.boundGuild] - id of the parent object of the index
     * @return {Promise.<void>}
     */
    async removeFromIndex(id, objectId = this.boundGuild) {
        return this.storageEngine.removeFromList(this.buildId(objectId), id);
    }

    /**
     * Check if an id is a member of an index
     * @param {String} id - id to check
     * @param {String} [objectId=this.boundGuild] - id of the parent object of the index
     * @return {Promise.<boolean>} - returns true if it is a part of the index, false otherwise
     */
    async isIndexed(id, objectId = this.boundGuild) {
        return this.storageEngine.isListMember(this.buildId(objectId), id);
    }

    /**
     * Get all members from an index
     * @param {String} [objectId=this.boundGuild] - id of the parent object of the index
     * @return {Promise.<String[]>}
     */
    async getIndexMembers(objectId = this.boundGuild) {
        return this.storageEngine.getListMembers(this.buildId(objectId));
    }

    /**
     * Delete an index
     * @param {String} [objectId=this.boundGuild] - id of the parent object of the index
     * @return {Promise.<void>}
     */
    async removeIndex(objectId = this.boundGuild) {
        return this.storageEngine.removeList(this.buildId(objectId));
    }

    /**
     * Get the number of elements that are within an index
     * @param {String} [objectId=this.boundGuild] - id of the parent object of the index
     * @return {Promise.<Number>}
     */
    async getIndexCount(objectId = this.boundGuild) {
        return this.storageEngine.getListCount(this.buildId(objectId));
    }
}

module.exports = BaseCache;
