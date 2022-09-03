import BaseCache from "./BaseCache";

/**
 * Cache used for saving overwrites of permissions belonging to channels
 */
class PermissionOverwriteCache extends BaseCache<import("discord-typings").Overwrite> {
	public boundChannel = "";
	public namespace = "permissionoverwrite" as const;

	/**
	 * Get a permission overwrite via id
	 * @param id id of the permission overwrite
	 * @param channelId - id of the channel that belongs to the permission overwrite
	 * @returns returns a bound permission overwrite cache or null if nothing was found
	 */
	public async get(id: string, channelId: string = this.boundChannel): Promise<PermissionOverwriteCache | null> {
		if (this.boundObject) return this;
		const permissionOverwrite = await this.storageEngine.get(this.buildId(id, channelId));
		if (!permissionOverwrite) return null;
		return new PermissionOverwriteCache(this.storageEngine, this.rain).bindObject(permissionOverwrite);
	}

	/**
	 * Update a permission overwrite entry in the cache
	 * @param id id of the permission overwrite
	 * @param channelId id of the channel that belongs to the permission overwrite
	 * @param data updated permission overwrite data, will be merged with the old data
	 * @returns returns a bound permission overwrite cache
	 */
	public async update(id: string, channelId: string = this.boundChannel, data: Partial<import("discord-typings").Overwrite>): Promise<PermissionOverwriteCache> {
		if (this.rain.options.disabledCaches.permOverwrite) return this;
		if (this.boundObject) this.bindObject(data);
		await super.addToIndex([id], channelId);
		const old = await this.storageEngine.upsert(this.buildId(id, channelId), this.structurize(data));
		if (this.boundObject) return this;
		return new PermissionOverwriteCache(this.storageEngine, this.rain).bindObject(data, old);
	}

	/**
	 * Remove a permission overwrite entry from the cache
	 * @param id id of the permission overwrite
	 * @param channelId id of the channel that belongs to the permission overwrite
	 */
	public async remove(id: string, channelId: string = this.boundChannel): Promise<void> {
		await super.removeFromIndex(id, channelId);
		await this.storageEngine.remove(this.buildId(id, channelId));
	}

	/**
	 * Filter for permission overwrites by providing a filter function which returns true upon success and false otherwise
	 * @param fn filter function to use for the filtering
	 * @param channelId id of the channel that belongs to the permission overwrite
	 * @param ids Array of permission overwrite ids, if omitted the permission overwrite index will be used
	 * @returns returns an array of bound permission overwrite caches
	 */
	public async filter(fn: (overwrite: import("discord-typings").Overwrite, index: number) => boolean, channelId: string = this.boundChannel, ids?: Array<string>): Promise<Array<PermissionOverwriteCache>> {
		const permissionOverwrites = await this.storageEngine.filter(fn, ids || null, super.buildId(channelId));
		return permissionOverwrites.map(p => new PermissionOverwriteCache(this.storageEngine, this.rain).bindObject(p));
	}

	/**
	 * Find a permission overwrite by providing a filter function which returns true upon success and false otherwise
	 * @param fn filter function to use for the filtering
	 * @param channelId id of the channel that belongs to the permission overwrite
	 * @param ids Array of permission overwrite ids, if omitted the permission overwrite index will be used
	 * @returns returns a bound permission overwrite cache
	 */
	public async find(fn: (overwrite: import("discord-typings").Overwrite, index: number) => boolean, channelId: string = this.boundChannel, ids?: Array<string>): Promise<PermissionOverwriteCache | null> {
		const permissionOverwrite = await this.storageEngine.find(fn, ids || null, super.buildId(channelId));
		if (!permissionOverwrite) return null;
		return new PermissionOverwriteCache(this.storageEngine, this.rain).bindObject(permissionOverwrite);
	}

	/**
	 * Build a unique key for storing the data in the datasource
	 * @param permissionId id of the permission overwrite
	 * @param channelId id of the channel that belongs to the permission overwrite
	 */
	public buildId(permissionId: string, channelId?: string): string {
		if (!channelId) return super.buildId(permissionId);
		return `${this.namespace}.${channelId}.${permissionId}`;
	}

	/**
	 * Bind a channel id to this permission overwrite cache
	 * @param channelId id of the channel that belongs to the permission overwrite
	 * @returns returns a permission overwrite cache with boundChannel set to the passed channelId
	 */
	public bindChannel(channelId: string): PermissionOverwriteCache {
		this.boundChannel = channelId;
		this.boundGuild = channelId;
		return this;
	}
}

export default PermissionOverwriteCache;
