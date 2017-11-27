'use strict';
let BaseCache = require('./BaseCache');

/**
 * Cache responsible for storing role related data
 * @extends BaseCache
 */
class RoleCache extends BaseCache {
    /**
     * Create a new RoleCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param {StorageEngine} storageEngine - Storage engine to use for this cache
     * @param {Role} boundObject - Optional, may be used to bind a role object to the cache
     * @property {String} namespace=role - namespace of the cache, defaults to `role`
     */
    constructor(storageEngine, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = 'role';
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    /**
     * Get a role via id and guild id of the role
     * @param {String} id - id of the role
     * @param {String} guildId - id of the guild belonging to the role
     * @return {Promise.<RoleCache|null>} Returns a Role Cache with a bound role or null if no role was found
     */
    async get(id, guildId) {
        if (this.boundObject) {
            return this.boundObject;
        }
        let role = await this.storageEngine.get(this.buildId(id, guildId));
        if (!role) {
            return null;
        }
        return new RoleCache(this.storageEngine, role);
    }

    /**
     * Update a role
     * @param id
     * @param guildId
     * @param data
     */
    async update(id, guildId, data) {
        if (this.boundObject) {
            this.bindObject(data);
            await this.update(this.boundObject.id, this.bindObject.guild_id, data);
            return this;
        }
        if (!guildId) {
            return;
        }
        if (!data.guild_id) {
            data.guild_id = guildId;
        }
        if (!data.id) {
            data.id = id;
        }
        await this.addToIndex(id, guildId);
        await this.storageEngine.upsert(this.buildId(id, guildId), data);
        return new RoleCache(this.storageEngine, data);
    }

    async remove(id, guildId) {
        if (this.boundObject) {
            return this.remove(this.boundObject.id, this.boundObject.guild_id);
        }
        let role = await this.storageEngine.get(this.buildId(id, guildId));
        if (role) {
            await this.removeFromIndex(id, guildId);
            return this.storageEngine.remove(this.buildId(id, guildId));
        } else {
            return null;
        }
    }

    async filter(fn, guildId = this.boundGuild, ids = null) {
        let roles = await this.storageEngine.filter(fn, ids, super.buildId(guildId));
        return roles.map(r => new RoleCache(this.storageEngine, r));
    }

    async find(fn, guildId = this.boundGuild, ids = null) {
        let role = await this.storageEngine.find(fn, ids, super.buildId(guildId));
        return new RoleCache(this.storageEngine, role);
    }

    buildId(roleId, guildId) {
        if (!guildId) {
            return super.buildId(roleId);
        }
        return `${this.namespace}.${guildId}.${roleId}`;
    }
}

/**
 * @typedef {Object} Role - a discord role object
 * @property {String} id - role id
 * @property {String} name - role name
 * @property {Number} color - integer representation of hexadecimal color code
 * @property {Boolean} hoist - if this role is hoisted
 * @property {Number} position - position of the role
 * @property {Number} permissions - permission bit set
 * @property {Boolean} managed - if this role is managed by an integration
 * @property {Boolean} mentionable - if this role can be mentioned
 */

module.exports = RoleCache;
