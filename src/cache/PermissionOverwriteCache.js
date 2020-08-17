const BaseCache = require("./BaseCache");

/**
 * Cache used for saving overwrites of permissions belonging to channels
 * @extends BaseCache
 */
class PermissionOverwriteCache extends BaseCache {
	/**
	 * Create a new PermissionOverwriteCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param {import("../storageEngine/BaseStorageEngine")} storageEngine - Storage engine to use for this cache
	 * @param {import("./ChannelCache").PermissionOverwrite} [boundObject] - Optional, may be used to bind a permission overwrite object to this cache
	 */
	constructor(storageEngine, boundObject) {
		super();
		this.storageEngine = storageEngine;
		this.namespace = "permissionoverwrite";
		this.boundChannel = "";
		if (boundObject) {
			this.bindObject(boundObject);
		}
	}

	/**
	 * Get a permission overwrite via id
	 * @param {string} id - id of the permission overwrite
	 * @param {string} channelId=this.boundChannel - id of the channel that belongs to the permission overwrite
	 * @return {Promise<PermissionOverwriteCache|null>} - returns a bound permission overwrite cache or null if nothing was found
	 */
	async get(id, channelId = this.boundChannel) {
		if (this.boundObject) {
			return this.boundObject;
		}
		const permissionOverwrite = await this.storageEngine.get(this.buildId(id, channelId));
		if (permissionOverwrite) {
			return new PermissionOverwriteCache(this.storageEngine, permissionOverwrite);
		} else {
			return null;
		}
	}

	/**
	 * Update a permission overwrite entry in the cache
	 * @param {string} id - id of the permission overwrite
	 * @param {string} channelId=this.boundChannel - id of the channel that belongs to the permission overwrite
	 * @param {import("./ChannelCache").PermissionOverwrite} data - updated permission overwrite data, will be merged with the old data
	 * @return {Promise<PermissionOverwriteCache>} - returns a bound permission overwrite cache
	 */
	async update(id, channelId = this.boundChannel, data) {
		if (this.boundObject) {
			this.bindObject(data);
			await this.update(id, channelId, data);
			return this;
		}
		await super.addToIndex(id, channelId);
		await this.storageEngine.upsert(this.buildId(id, channelId), data);
		return new PermissionOverwriteCache(this.storageEngine, data);
	}

	/**
	 * Remove a permission overwrite entry from the cache
	 * @param {string} id - id of the permission overwrite
	 * @param {string} channelId=this.boundChannel - id of the channel that belongs to the permission overwrite
	 * @return {Promise<void>}
	 */
	async remove(id, channelId = this.boundChannel) {
		if (this.boundObject) {
			return this.remove(this.boundObject.id, channelId);
		}
		const permissionOverwrite = await this.storageEngine.get(this.buildId(id, channelId));
		if (permissionOverwrite) {
			await super.removeFromIndex(id, channelId);
			return this.storageEngine.remove(this.buildId(id, channelId));
		} else {
			return null;
		}
	}

	/**
	 * Filter for permission overwrites by providing a filter function which returns true upon success and false otherwise
	 * @param {(overwrite: import("./ChannelCache").PermissionOverwrite) => boolean} fn - filter function to use for the filtering
	 * @param {string} channelId=this.boundChannel - id of the channel that belongs to the permission overwrite
	 * @param {Array<string>} ids - Array of permission overwrite ids, if omitted the permission overwrite index will be used
	 * @return {Promise<Array<PermissionOverwriteCache>>} - returns an array of bound permission overwrite caches
	 */
	async filter(fn, channelId = this.boundChannel, ids = null) {
		const permissionOverwrites = await this.storageEngine.filter(fn, ids, super.buildId(channelId));
		return permissionOverwrites.map(p => new PermissionOverwriteCache(this.storageEngine, p));
	}

	/**
	 * Find a permission overwrite by providing a filter function which returns true upon success and false otherwise
	 * @param {(overwrite: import("./ChannelCache").PermissionOverwrite) => boolean} fn - filter function to use for the filtering
	 * @param {string} channelId=this.boundChannel - id of the channel that belongs to the permission overwrite
	 * @param {Array<string>} ids - Array of permission overwrite ids, if omitted the permission overwrite index will be used
	 * @return {Promise<PermissionOverwriteCache>} - returns a bound permission overwrite cache
	 */
	async find(fn, channelId = this.boundChannel, ids = null) {
		const permissionOverwrite = await this.storageEngine.find(fn, ids, super.buildId(channelId));
		return new PermissionOverwriteCache(this.storageEngine, permissionOverwrite);
	}

	/**
	 * Build a unique key for storing the data in the datasource
	 * @param {string} permissionId - id of the permission overwrite
	 * @param {string} channelId=this.boundChannel - id of the channel that belongs to the permission overwrite
	 */
	// @ts-ignore
	buildId(permissionId, channelId) {
		if (!channelId) {
			return super.buildId(permissionId);
		}
		return `${this.namespace}.${channelId}.${permissionId}`;
	}

	/**
	 * Bind a channel id to this permission overwrite cache
	 * @param {string} channelId - id of the channel that belongs to the permission overwrite
	 * @return {PermissionOverwriteCache} - returns a permission overwrite cache with boundChannel set to the passed channelId
	 */
	bindChannel(channelId) {
		this.boundChannel = channelId;
		this.boundGuild = channelId;
		return this;
	}
}

module.exports = PermissionOverwriteCache;
