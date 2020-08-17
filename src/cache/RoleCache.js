const BaseCache = require("./BaseCache");

/**
 * Cache responsible for storing role related data
 * @extends BaseCache
 */
class RoleCache extends BaseCache {
	/**
	 * Create a new RoleCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param {import("../storageEngine/BaseStorageEngine")} storageEngine - Storage engine to use for this cache
	 * @param {Role} boundObject - Optional, may be used to bind a role object to the cache
	 */
	constructor(storageEngine, boundObject) {
		super();
		this.storageEngine = storageEngine;
		this.namespace = "role";
		if (boundObject) {
			this.bindObject(boundObject);
		}
	}

	/**
	 * Get a role via id and guild id of the role
	 * @param {string} id - id of the role
	 * @param {string} guildId - id of the guild belonging to the role
	 * @return {Promise<RoleCache|null>} Returns a Role Cache with a bound role or null if no role was found
	 */
	async get(id, guildId) {
		if (this.boundObject) {
			return this.boundObject;
		}
		const role = await this.storageEngine.get(this.buildId(id, guildId));
		if (!role) {
			return null;
		}
		return new RoleCache(this.storageEngine, role);
	}

	/**
	 * Update a role
	 * @param {string} id - id of the role
	 * @param {string} guildId - id of the guild belonging to the role
	 * @param {Role} data - new role data
	 * @return {Promise<RoleCache>} - returns a bound RoleCache once the data was updated.
	 */
	async update(id, guildId, data) {
		if (this.boundObject) {
			this.bindObject(data);
			await this.update(this.boundObject.id, this.bindObject.guild_id, data);
			return this;
		}
		if (!guildId) {
			return Promise.reject("Missing guild id");
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

	/**
	 * Remove a role from the cache
	 * @param {string} id - id of the role
	 * @param {string} guildId - id of the guild belonging to the role
	 * @return {Promise<void>}
	 */
	async remove(id, guildId) {
		if (this.boundObject) {
			return this.remove(this.boundObject.id, this.boundObject.guild_id);
		}
		const role = await this.storageEngine.get(this.buildId(id, guildId));
		if (role) {
			await this.removeFromIndex(id, guildId);
			return this.storageEngine.remove(this.buildId(id, guildId));
		} else {
			return null;
		}
	}

	/**
	 * Filter for roles by providing a filter function which returns true upon success and false otherwise
	 * @param {Function} fn - filter function to use for the filtering
	 * @param {string} guildId - id of the guild belonging to the roles
	 * @param {Array<string>} ids - array of role ids that should be used for the filtering
	 * @return {Promise<Array<RoleCache>>} - array of bound role caches
	 */
	async filter(fn, guildId = this.boundGuild, ids = null) {
		const roles = await this.storageEngine.filter(fn, ids, super.buildId(guildId));
		return roles.map(r => new RoleCache(this.storageEngine, r));
	}

	/**
	 * Find a role by providing a filter function which returns true upon success and false otherwise
	 * @param {Function} fn - filter function to use for filtering for a single role
	 * @param {string} guildId - id of the guild belonging to the roles
	 * @param {Array<string>} ids - array of role ids that should be used for the filtering
	 * @return {Promise<RoleCache>} - bound role cache
	 */
	async find(fn, guildId = this.boundGuild, ids = null) {
		const role = await this.storageEngine.find(fn, ids, super.buildId(guildId));
		return new RoleCache(this.storageEngine, role);
	}

	/**
	 * Build a unique key for the role cache entry
	 * @param {string} roleId - id of the role
	 * @param {string} guildId - id of the guild belonging to the role
	 * @return {string} - the prepared key
	 */
	// @ts-ignore
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
 * @property {Number} position - position of the role, Roles with a lower position can't execute actions on roles with a higher position
 * @property {Number} permissions - permission bit set
 * @property {Boolean} managed - if this role is managed by an integration (also true for bot roles that are added when you add a bot that requires permissions)
 * @property {Boolean} mentionable - if this role can be mentioned
 * @property {String} guild_id - optional guild id, of the guild that owns this role, not supplied by discord.
 */

module.exports = RoleCache;
