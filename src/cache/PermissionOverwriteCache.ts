import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";

/**
 * Cache used for saving overwrites of permissions belonging to channels
 * @extends BaseCache
 */
class PermissionOverwriteCache extends BaseCache<import("discord-typings").PermissionOverwriteData> {
	public boundChannel = "";
	public namespace: "permissionoverwrite" = "permissionoverwrite";
	public storageEngine: BaseStorageEngine<import("discord-typings").PermissionOverwriteData>;

	/**
	 * Create a new PermissionOverwriteCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param storageEngine Storage engine to use for this cache
	 * @param boundObject Optional, may be used to bind a permission overwrite object to this cache
	 */
	public constructor(storageEngine: BaseStorageEngine<import("discord-typings").PermissionOverwriteData>, rain: import("../RainCache")<any, any>, boundObject?: Partial<import("discord-typings").PermissionOverwriteData>) {
		super(rain);
		this.storageEngine = storageEngine;
		if (boundObject) this.bindObject(boundObject);
	}

	/**
	 * Get a permission overwrite via id
	 * @param id id of the permission overwrite
	 * @param channelId - id of the channel that belongs to the permission overwrite
	 * @returns returns a bound permission overwrite cache or null if nothing was found
	 */
	public async get(id: string, channelId: string = this.boundChannel): Promise<PermissionOverwriteCache | null> {
		if (this.boundObject) return this;
		const permissionOverwrite = await this.storageEngine.get(this.buildId(id, channelId));
		if (permissionOverwrite) return new PermissionOverwriteCache(this.storageEngine, this.rain, permissionOverwrite);
		else return null;
	}

	/**
	 * Update a permission overwrite entry in the cache
	 * @param id id of the permission overwrite
	 * @param channelId id of the channel that belongs to the permission overwrite
	 * @param data updated permission overwrite data, will be merged with the old data
	 * @returns returns a bound permission overwrite cache
	 */
	public async update(id: string, channelId: string = this.boundChannel, data: Partial<import("discord-typings").PermissionOverwriteData>): Promise<PermissionOverwriteCache> {
		if (this.boundObject) this.bindObject(data);
		await super.addToIndex(id, channelId);
		await this.storageEngine.upsert(this.buildId(id, channelId), this.structurize(data));
		if (this.boundObject) return this;
		return new PermissionOverwriteCache(this.storageEngine, this.rain, data);
	}

	/**
	 * Remove a permission overwrite entry from the cache
	 * @param id id of the permission overwrite
	 * @param channelId id of the channel that belongs to the permission overwrite
	 */
	public async remove(id: string, channelId: string = this.boundChannel): Promise<void> {
		await super.removeFromIndex(id, channelId);
		return this.storageEngine.remove(this.buildId(id, channelId));
	}

	/**
	 * Filter for permission overwrites by providing a filter function which returns true upon success and false otherwise
	 * @param fn filter function to use for the filtering
	 * @param channelId id of the channel that belongs to the permission overwrite
	 * @param ids Array of permission overwrite ids, if omitted the permission overwrite index will be used
	 * @returns returns an array of bound permission overwrite caches
	 */
	public async filter(fn: (overwrite?: import("discord-typings").PermissionOverwriteData, index?: number, array?: Array<import("discord-typings").PermissionOverwriteData>) => unknown, channelId: string = this.boundChannel, ids: Array<string> | undefined = undefined): Promise<Array<PermissionOverwriteCache>> {
		const permissionOverwrites = await this.storageEngine.filter(fn, ids, super.buildId(channelId));
		return permissionOverwrites.map(p => new PermissionOverwriteCache(this.storageEngine, this.rain, p));
	}

	/**
	 * Find a permission overwrite by providing a filter function which returns true upon success and false otherwise
	 * @param fn filter function to use for the filtering
	 * @param channelId id of the channel that belongs to the permission overwrite
	 * @param ids Array of permission overwrite ids, if omitted the permission overwrite index will be used
	 * @returns returns a bound permission overwrite cache
	 */
	public async find(fn: (overwrite?: import("discord-typings").PermissionOverwriteData, index?: number, array?: Array<string>) => unknown, channelId: string = this.boundChannel, ids: Array<string> | undefined = undefined): Promise<PermissionOverwriteCache | null> {
		const permissionOverwrite = await this.storageEngine.find(fn, ids, super.buildId(channelId));
		if (!permissionOverwrite) return null;
		return new PermissionOverwriteCache(this.storageEngine, this.rain, permissionOverwrite);
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

export = PermissionOverwriteCache;
