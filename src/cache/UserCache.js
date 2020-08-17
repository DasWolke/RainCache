const BaseCache = require("./BaseCache");

/**
 * Cache responsible for caching users
 * @extends BaseCache
 */
class UserCache extends BaseCache {
	/**
	 * Create a new UserCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param {import("../storageEngine/BaseStorageEngine")} storageEngine - Storage engine to use for this cache
	 * @param {import("@amanda/discordtypings").UserData} boundObject - Optional, may be used to bind a user object to the cache
	 */
	constructor(storageEngine, boundObject) {
		super();
		this.storageEngine = storageEngine;
		this.namespace = "user";
		if (boundObject) {
			this.bindObject(boundObject);
		}
	}

	/**
	 * Loads a user from the cache via id
	 * @param {string} [id=this.id] - discord id of the user
	 * @return {Promise<UserCache|Null>} Returns a User Cache with a bound user or null if no user was found
	 */
	async get(id = this.id) {
		if (this.boundObject) {
			return this.boundObject;
		}
		const user = await this.storageEngine.get(this.buildId(id));
		if (!user) {
			return null;
		}
		return new UserCache(this.storageEngine, user);
	}

	/**
	 * Update a user entry in the cache
	 * @param {string} id=this.id - discord id of the user
	 * @param {import("@amanda/discordtypings").UserData} data - updated data of the user, it will be merged with the old data
	 * @return {Promise<UserCache>}
	 */
	async update(id = this.id, data) {
		if (this.boundObject) {
			this.bindObject(data);
			await this.update(id, data);
			return this;
		}
		await this.addToIndex(id);
		await this.storageEngine.upsert(this.buildId(id), data);
		return new UserCache(this.storageEngine, data);
	}

	/**
	 * Remove a user from the cache
	 * @param {string} id=this.id - discord id of the user
	 * @return {Promise<void>}
	 */
	async remove(id = this.id) {
		if (this.boundObject) {
			return this.remove(this.boundObject.id);
		}
		const user = await this.storageEngine.get(this.buildId(id));
		if (user) {
			await this.removeFromIndex(id);
			return this.storageEngine.remove(this.buildId(id));
		} else {
			return null;
		}
	}

	/**
	 * Filter for users by providing a filter function which returns true upon success and false otherwise
	 * @param {(user: import("@amanda/discordtypings").UserData) => boolean} fn - filter function to use for the filtering
	 * @param {Array<string>} ids - Array of user ids, if omitted the global user index will be used
	 * @return {Promise<UserCache[]>}
	 */
	async filter(fn, ids = null) {
		const users = await this.storageEngine.filter(fn, ids, this.namespace);
		return users.map(u => new UserCache(this.storageEngine, u));
	}

	/**
	 * Find a user by providing a filter function which returns true upon success and false otherwise
	 * @param {(user: import("@amanda/discordtypings").UserData) => boolean} fn - filter function to use for filtering for a user
	 * @param {Array<string>} ids - List of ids that should be used as the scope of the filter
	 * @return {Promise.<UserCache|null>} - Returns a User Cache with a bound user or null if no user was found
	 */
	async find(fn, ids = null) {
		const user = await this.storageEngine.find(fn, ids, this.namespace);
		if (!user) {
			return null;
		}
		return new UserCache(this.storageEngine, user);
	}

	/**
	 * Bind a user id to the cache, used by the member cache
	 * @param {string} userId - id of the user
	 * @return {UserCache} - Returns a UserCache that has an id bound to it, which serves as the default argument to get, update and delete
	 */
	bindUserId(userId) {
		this.id = userId;
		return this;
	}

	/**
	 * Add a user to the index
	 * @param {string} id - id of the user
	 * @return {Promise<void>}
	 */
	async addToIndex(id) {
		return this.storageEngine.addToList(this.namespace, id);
	}

	/**
	 * Remove a user from the index
	 * @param {string} id - id of the user
	 * @return {Promise<void>}
	 */
	async removeFromIndex(id) {
		return this.storageEngine.removeFromList(this.namespace, id);
	}

	/**
	 * Check if a user is indexed
	 * @param {string} id - id of the user
	 * @return {Promise<boolean>} - True if the user is indexed, false otherwise
	 */
	async isIndexed(id) {
		return this.storageEngine.isListMember(this.namespace, id);
	}

	/**
	 * Get a list of currently indexed users, since users is a global namespace,
	 * this will return **ALL** users that the bot cached currently
	 * @return {Promise<Array<string>>} - Array with a list of ids of users that are indexed
	 */
	async getIndexMembers() {
		return this.storageEngine.getListMembers(this.namespace);
	}

	/**
	 * Delete the user index, you should probably **not** use this function, but I won't stop you.
	 * @return {Promise<void>}
	 */
	async removeIndex() {
		return this.storageEngine.removeList(this.namespace);
	}

	/**
	 * Get the number of users that are currently cached
	 * @return {Promise<number>} - Number of users currently cached
	 */
	async getIndexCount() {
		return this.storageEngine.getListCount(this.namespace);
	}
}

module.exports = UserCache;
