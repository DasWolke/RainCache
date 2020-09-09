const BaseCache = require("./BaseCache");

/**
 * Cache responsible for caching users
 * @extends BaseCache
 */
class VoiceStateCache extends BaseCache {
	/**
	 * Create a new VoiceStateCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param {import("../storageEngine/BaseStorageEngine")} storageEngine - Storage engine to use for this cache
	 * @param {import("@amanda/discordtypings").VoiceStateData} boundObject - Optional, may be used to bind a user object to the cache
	 */
	constructor(storageEngine, boundObject) {
		super();
		this.storageEngine = storageEngine;
		this.namespace = "voicestates";
		if (boundObject) {
			this.bindObject(boundObject);
		}
	}
	/**
	 * Loads a VoiceState from the cache via id
	 * @param {string} [id=this.user_id] - discord id of the user
	 * @param {string} [channelId] - channel id
	 * @return {Promise<?VoiceStateCache>} Returns a VoiceState Cache with a bound user or null if no user was found
	 */
	async get(id = this.user_id, channelId) {
		if (this.boundObject) {
			return this.boundObject;
		}
		const state = await this.storageEngine.get(this.buildId(id, channelId));
		if (!state) {
			return null;
		}
		return new VoiceStateCache(this.storageEngine, state);
	}

	/**
	 * Update a VoiceState entry in the cache
	 * @param {string} id - discord id of the user
	 * @param {string} channelId - channel id
	 * @param {import("@amanda/discordtypings").VoiceStateData} data - updated data of the VoiceState, it will be merged with the old data
	 * @return {Promise<VoiceStateCache>}
	 */
	async update(id, channelId, data) {
		if (this.boundObject) {
			this.bindObject(data);
			await this.update(id, channelId, data);
			return this;
		}

		delete data.member;

		await this.addToIndex(id);
		await this.storageEngine.upsert(this.buildId(id, channelId), data);
		return new VoiceStateCache(this.storageEngine, data);
	}

	/**
	 * Remove a VoiceState from the cache
	 * @param {string} [id=this.user_id] - discord id of the user
	 * @param {string} [channelId] - channel id
	 * @return {Promise<void>}
	 */
	async remove(id = this.user_id, channelId) {
		if (this.boundObject) {
			return this.remove(this.boundObject.id);
		}
		const state = await this.storageEngine.get(this.buildId(id, channelId));
		if (state) {
			await this.removeFromIndex(id);
			return this.storageEngine.remove(this.buildId(id, channelId));
		} else {
			return null;
		}
	}

	/**
	 * Filter for VoiceStates by providing a filter function which returns true upon success and false otherwise
	 * @param {(state: import("@amanda/discordtypings").VoiceStateData) => boolean} fn - filter function to use for the filtering
	 * @param {Array<string>} ids - Array of user ids, if omitted the global user index will be used
	 * @return {Promise<Array<VoiceStateCache>>}
	 */
	async filter(fn, ids = null) {
		const states = await this.storageEngine.filter(fn, ids, this.namespace);
		return states.map(s => new VoiceStateCache(this.storageEngine, s));
	}

	/**
	 * Find a VoiceState by providing a filter function which returns true upon success and false otherwise
	 * @param {(state: import("@amanda/discordtypings").VoiceStateData) => boolean} fn - filter function to use for filtering for a state
	 * @param {Array<string>} ids - List of ids that should be used as the scope of the filter
	 * @return {Promise<?VoiceStateCache>} - Returns a VoiceState Cache with a bound state or null if no state was found
	 */
	async find(fn, ids = null) {
		const state = await this.storageEngine.find(fn, ids, this.namespace);
		if (!state) {
			return null;
		}
		return new VoiceStateCache(this.storageEngine, state);
	}

	/**
	 * Bind a user id to the cache
	 * @param {string} userId - id of the user
	 * @return {VoiceStateCache} - Returns a VoiceStateCache that has an id bound to it, which serves as the default argument to get, update and delete
	 */
	bindUserId(userId) {
		this.user_id = userId;
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
	 * Remove a VoiceState from the index
	 * @param {string} id - id of the user
	 * @return {Promise<void>}
	 */
	async removeFromIndex(id) {
		return this.storageEngine.removeFromList(this.namespace, id);
	}

	/**
	 * Check if a VoiceState is indexed
	 * @param {string} id - id of the user
	 * @return {Promise<boolean>} - True if the state is indexed, false otherwise
	 */
	async isIndexed(id) {
		return this.storageEngine.isListMember(this.namespace, id);
	}

	/**
	 * Get a list of currently indexed VoiceStates, since VoiceStates is a global namespace,
	 * this will return **ALL** VoiceStates that the bot cached currently
	 * @return {Promise<Array<string>>} - Array with a list of ids of users that are indexed
	 */
	async getIndexMembers() {
		return this.storageEngine.getListMembers(this.namespace);
	}

	/**
	 * Delete the VoiceState index, you should probably **not** use this function, but I won't stop you.
	 * @return {Promise<void>}
	 */
	async removeIndex() {
		return this.storageEngine.removeList(this.namespace);
	}

	/**
	 * Get the number of VoiceStates that are currently cached
	 * @return {Promise<number>} - Number of VoiceStates currently cached
	 */
	async getIndexCount() {
		return this.storageEngine.getListCount(this.namespace);
	}

	/**
	 * Build a unique key for storing VoiceState data
	 * @param {string} userId - id of the user
	 * @param {string} channelId - id of the channel
	 * @return {any}
	 */
	// @ts-ignore
	buildId(userId, channelId) {
		if (!channelId) {
			return super.buildId(userId);
		}
		return `${this.namespace}.${channelId}.${userId}`;
	}
}

module.exports = VoiceStateCache;
