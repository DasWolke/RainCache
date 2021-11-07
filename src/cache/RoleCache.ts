import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";

/**
 * Cache responsible for storing role related data
 */
class RoleCache extends BaseCache<import("discord-typings").RoleData> {
	public namespace: "role" = "role";
	public storageEngine: BaseStorageEngine<import("discord-typings").RoleData>;

	/**
	 * Create a new RoleCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param storageEngine Storage engine to use for this cache
	 * @param boundObject Optional, may be used to bind a role object to the cache
	 */
	public constructor(storageEngine: BaseStorageEngine<import("discord-typings").RoleData>, rain: import("../RainCache")<any, any>, boundObject?: Partial<import("discord-typings").RoleData & { guild_id: string }>) {
		super(rain);
		this.storageEngine = storageEngine;
		if (boundObject) this.bindObject(boundObject);
	}

	/**
	 * Get a role via id and guild id of the role
	 * @param id id of the role
	 * @param guildId id of the guild belonging to the role
	 * @returns Returns a Role Cache with a bound role or null if no role was found
	 */
	public async get(id: string, guildId: string): Promise<RoleCache | null> {
		if (this.boundObject) return this;
		const role = await this.storageEngine.get(this.buildId(id, guildId));
		if (!role) return null;
		return new RoleCache(this.storageEngine, this.rain, role);
	}

	/**
	 * Update a role
	 * @param id - id of the role
	 * @param guildId - id of the guild belonging to the role
	 * @param data - new role data
	 * @returns returns a bound RoleCache once the data was updated.
	 */
	public async update(id: string, guildId: string, data: Partial<import("discord-typings").RoleData & { guild_id: string }>): Promise<RoleCache> {
		if (!guildId) return Promise.reject("Missing guild id");
		if (!data.guild_id) data.guild_id = guildId;
		if (!data.id) data.id = id;
		if (this.boundObject) this.bindObject(data);
		await this.addToIndex(id, guildId);
		await this.storageEngine.upsert(this.buildId(id, guildId), this.structurize(data));
		if (this.boundObject) return this;
		return new RoleCache(this.storageEngine, this.rain, data);
	}

	/**
	 * Remove a role from the cache
	 * @param id id of the role
	 * @param guildId id of the guild belonging to the role
	 */
	public async remove(id: string, guildId: string): Promise<void> {
		await this.removeFromIndex(id, guildId);
		return this.storageEngine.remove(this.buildId(id, guildId));
	}

	/**
	 * Filter for roles by providing a filter function which returns true upon success and false otherwise
	 * @param fn filter function to use for the filtering
	 * @param guildId id of the guild belonging to the roles
	 * @param ids array of role ids that should be used for the filtering
	 * @returns array of bound role caches
	 */
	public async filter(fn: (role?: import("discord-typings").RoleData, index?: number, array?: Array<import("discord-typings").RoleData>) => unknown, guildId = this.boundGuild, ids: Array<string> | undefined = undefined): Promise<Array<RoleCache>> {
		const roles = await this.storageEngine.filter(fn, ids, super.buildId(guildId as string));
		return roles.map(r => new RoleCache(this.storageEngine, this.rain, r));
	}

	/**
	 * Find a role by providing a filter function which returns true upon success and false otherwise
	 * @param fn filter function to use for filtering for a single role
	 * @param guildId id of the guild belonging to the roles
	 * @param ids array of role ids that should be used for the filtering
	 * @returns bound role cache
	 */
	public async find(fn: (role?: import("discord-typings").RoleData, index?: number, array?: Array<string>) => unknown, guildId = this.boundGuild, ids: Array<string> | undefined = undefined): Promise<RoleCache | null> {
		const role = await this.storageEngine.find(fn, ids, super.buildId(guildId as string));
		if (!role) return null;
		return new RoleCache(this.storageEngine, this.rain, role);
	}

	/**
	 * Build a unique key for the role cache entry
	 * @param roleId id of the role
	 * @param guildId id of the guild belonging to the role
	 * @returns the prepared key
	 */
	public buildId(roleId: string, guildId?: string): string {
		if (!guildId) return super.buildId(roleId);
		return `${this.namespace}.${guildId}.${roleId}`;
	}
}

export = RoleCache;
