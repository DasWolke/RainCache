const BaseCache = require("./BaseCache");

/**
 * Cache responsible for storing channel related data
 */
class ChannelCache extends BaseCache {
	/**
	 * Create a new ChanneCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param {import("../storageEngine/BaseStorageEngine")} storageEngine - storage engine to use for this cache
	 * @param {import("./ChannelMapCache")} channelMap - Instantiated ChannelMap class
	 * @param {import("./PermissionOverwriteCache")} permissionOverwriteCache - Instantiated PermissionOverwriteCache class
	 * @param {import("./UserCache")} userCache - Instantiated UserCache class
	 * @param {import("@amanda/discordtypings").ChannelData} [boundObject] - Optional, may be used to bind a channel object to this cache
	 */
	constructor(storageEngine, channelMap, permissionOverwriteCache, userCache, boundObject) {
		super();
		this.storageEngine = storageEngine;
		this.namespace = "channel";
		this.channelMap = channelMap;
		this.permissionOverwrites = permissionOverwriteCache;
		this.recipients = userCache;
		if (boundObject) {
			this.bindObject(boundObject);
		}
	}

	/**
	 * Get a channel via id
	 * @param {string} id - id of the channel
	 * @returns {Promise<ChannelCache|null>} - ChannelCache with bound object or null if nothing was found
	 */
	async get(id) {
		if (this.boundObject) {
			return this.boundObject;
		}
		const channel = await this.storageEngine.get(this.buildId(id));
		if (channel) {
			return new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(channel.id), this.recipients, channel);
		} else {
			return null;
		}
	}

	/**
	 * Upsert a channel into the cache
	 * @param {string} id - id of the channel
	 * @param {Object} data - data to insert
	 * @returns {Promise<ChannelCache>}
	 */
	async update(id, data) {
		if (this.boundObject) {
			this.bindObject(data); //using bindobject() to assure the data of the class is valid
			await this.update(this.boundObject.id, data);
			return this;
		}
		if (data.guild_id) {
			await this.channelMap.update(data.guild_id, [data.id]);
		} else if (data.recipients) {
			if (data.recipients[0]) {
				await this.channelMap.update(data.recipients[0].id, [data.id], "user");
			}
		}
		if (data.permission_overwrites) {
			for (const overwrite of data.permission_overwrites) {
				await this.permissionOverwrites.update(overwrite.id, id, overwrite);
			}
		}
		delete data.permission_overwrites;
		delete data.recipients;
		await this.addToIndex(id);
		await this.storageEngine.upsert(this.buildId(id), data);
		const channel = await this.storageEngine.get(this.buildId(id));
		return new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(channel.id), this.recipients, channel);
	}

	/**
	 * Remove a channel from the cache
	 * @param {string} id - id of the channel
	 * @returns {Promise<void>}
	 */
	async remove(id) {
		if (this.boundObject) {
			return this.remove(this.boundObject.id);
		}
		const channel = await this.storageEngine.get(this.buildId(id));
		if (channel) {
			await this.removeFromIndex(id);
			return this.storageEngine.remove(this.buildId(id));
		} else {
			return null;
		}
	}

	/**
	 * Filter through the collection of channels
	 * @param {Function} fn - Filter function
	 * @param {Array<string>} channelMap - Array of ids used for the filter
	 * @returns {Promise<Array<ChannelCache>>} - array of channel caches with bound results
	 */
	async filter(fn, channelMap) {
		const channels = await this.storageEngine.filter(fn, channelMap, this.namespace);
		return channels.map(c => new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(c.id), this.recipients, c));
	}

	/**
	 * Filter through the collection of channels and return on the first result
	 * @param {Function} fn - Filter function
	 * @param {Array<string>} channelMap - Array of ids used for the filter
	 * @returns {Promise<ChannelCache>} - First result bound to a channel cache
	 */
	async find(fn, channelMap) {
		const channel = await this.storageEngine.find(fn, channelMap, this.namespace);
		return new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(channel.id), this.recipients, channel);
	}

	/**
	 * Add a channel to the channel index
	 * @param {string} id - id of the channel
	 * @returns {Promise<void>}
	 */
	async addToIndex(id) {
		return this.storageEngine.addToList(this.namespace, id);
	}

	/**
	 * Remove a channel from the index
	 * @param {string} id - id of the channel
	 * @returns {Promise<void>}
	 */
	async removeFromIndex(id) {
		return this.storageEngine.removeFromList(this.namespace, id);
	}

	/**
	 * Check if a channel is indexed
	 * @param {string} id - id of the channel
	 * @returns {Promise<boolean>}
	 */
	async isIndexed(id) {
		return this.storageEngine.isListMember(this.namespace, id);
	}

	/**
	 * Get a list of ids of indexed channels
	 * @returns {Promise<Array<string>>}
	 */
	async getIndexMembers() {
		return this.storageEngine.getListMembers(this.namespace);
	}

	/**
	 * Remove the channel index, you should probably not call this at all :<
	 * @returns {Promise<any>}
	 */
	async removeIndex() {
		return this.storageEngine.removeList(this.namespace);
	}

	/**
	 * Get the number of channels that are currently cached
	 * @return {Promise<number>} - Number of channels currently cached
	 */
	async getIndexCount() {
		return this.storageEngine.getListCount(this.namespace);
	}
}

/**
 * @typedef {Object} PermissionOverwrite - permission overwrite object, which is used to overwrite permissions on a channel level
 * @property {number} allow - bitwise value of allowed permissions
 * @property {number} deny - bitwise value of disallowed permissions
 * @property {string} type - type of the overwrite, either member or role
 */

module.exports = ChannelCache;
