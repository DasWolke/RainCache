const BaseCache = require("./BaseCache");

/**
 * Cache responsible for storing presence related data
 */
class PresenceCache extends BaseCache {
	/**
	 * Create a new Presence Cache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param {import("../storageEngine/BaseStorageEngine")} storageEngine - Storage engine to use for this cache
	 * @param {import("./UserCache")} userCache
	 * @param {Presence} boundObject - Optional, may be used to bind a presence object to the cache
	 */
	constructor(storageEngine, userCache, boundObject) {
		super();
		this.storageEngine = storageEngine;
		this.namespace = "presence";
		this.users = userCache;
		if (boundObject) {
			this.bindObject(boundObject);
		}
	}

	/**
	 * Get a presence via user id
	 * @param {string} id - id of a discord user
	 * @return {Promise<PresenceCache|null>} - Returns a new PresenceCache with bound data or null if nothing was found
	 */
	async get(id) {
		if (this.boundObject) {
			return this.boundObject;
		}
		const presence = await this.storageEngine.get(this.buildId(id));
		if (presence) {
			return new PresenceCache(this.storageEngine, this.users.bindUserId(id), presence);
		} else {
			return null;
		}
	}

	/**
	 * Upsert the presence of a user.
	 *
	 * **This function automatically removes the guild_id, roles and user of a presence update before saving it**
	 * @param {string} id - id of the user the presence belongs to
	 * @param {Presence} data - updated presence data of the user
	 * @return {Promise<PresenceCache>} - returns a bound presence cache
	 */
	async update(id, data) {
		if (this.boundObject) {
			this.bindObject(data);
			await this.update(id, data);
			return this;
		}
		if (data.guild_id) {
			delete data.guild_id;
		}
		if (data.roles) {
			delete data.roles;
		}
		if (data.user) {
			await this.users.update(data.user.id, data.user);
			delete data.user;
		}
		await this.storageEngine.upsert(this.buildId(id), data);
		return new PresenceCache(this.storageEngine, this.users, data);
	}

	/**
	 * Remove a stored presence from the cache
	 * @param {string} id - id of the user the presence belongs to
	 * @return {Promise<void>}
	 */
	async remove(id) {
		if (this.boundObject) {
			return this.remove(this.boundObject.id);
		}
		const presence = await this.storageEngine.get(this.buildId(id));
		if (presence) {
			return this.storageEngine.remove(this.buildId(id));
		} else {
			return null;
		}
	}
}

/**
 * @typedef {Object} Presence - A discord presence object
 * @property {import("@amanda/discordtypings").UserData} user - the user which presence is being updated
 * @property {Array<string>} roles - array of role ids that belong to the user
 * @property {Game} game - null or the current activity of the user
 * @property {string} guild_id - id of the guild
 * @property {string} status - status of the user, either "idle", "dnd", "online", or "offline"
 */

/**
 * @typedef {Object} Game - A discord game object
 * @property {string} name - name of the game
 * @property {number} type - type of the game, checkout [activity types](https://discordapp.com/developers/docs/topics/gateway#game-object-activity-types) for more info
 * @property {string} url - stream url, only present with a type value of 1
 */

module.exports = PresenceCache;
