import BaseCache from "./BaseCache";

export type Role = import("discord-typings").Role & { guild_id?: string }

/**
 * Cache responsible for storing role related data
 */
class RoleCache extends BaseCache<Role> {
	public namespace = "role" as const;

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
		return new RoleCache(this.storageEngine, this.rain).bindObject(role);
	}

	/**
	 * Update a role
	 * @param id - id of the role
	 * @param guildId - id of the guild belonging to the role
	 * @param roleData - new role data
	 * @returns returns a bound RoleCache once the data was updated.
	 */
	public async update(id: string, guildId: string, roleData: Partial<Role>): Promise<RoleCache> {
		if (this.rain.options.disabledCaches.role) return this;
		const data = Object.assign({}, roleData);
		if (!guildId) return Promise.reject("Missing guild id");
		if (!data.guild_id) data.guild_id = guildId;
		if (!data.id) data.id = id;
		if (this.boundObject) this.bindObject(data);
		await this.addToIndex([id], guildId);
		const old = await this.storageEngine.upsert(this.buildId(id, guildId), this.structurize(data));
		if (this.boundObject) return this;
		return new RoleCache(this.storageEngine, this.rain).bindObject(data, old);
	}

	/**
	 * Remove a role from the cache
	 * @param id id of the role
	 * @param guildId id of the guild belonging to the role
	 */
	public async remove(id: string, guildId: string): Promise<void> {
		await this.removeFromIndex(id, guildId);
		await this.storageEngine.remove(this.buildId(id, guildId));
	}

	/**
	 * Filter for roles by providing a filter function which returns true upon success and false otherwise
	 * @param fn filter function to use for the filtering
	 * @param guildId id of the guild belonging to the roles
	 * @param ids array of role ids that should be used for the filtering
	 * @returns array of bound role caches
	 */
	public async filter(fn: (role: Role, index: number) => boolean, guildId = this.boundGuild, ids?: Array<string>): Promise<Array<RoleCache>> {
		const roles = await this.storageEngine.filter(fn, ids || null, super.buildId(guildId as string));
		return roles.map(r => new RoleCache(this.storageEngine, this.rain).bindObject(r));
	}

	/**
	 * Find a role by providing a filter function which returns true upon success and false otherwise
	 * @param fn filter function to use for filtering for a single role
	 * @param guildId id of the guild belonging to the roles
	 * @param ids array of role ids that should be used for the filtering
	 * @returns bound role cache
	 */
	public async find(fn: (role: Role, index: number) => boolean, guildId = this.boundGuild, ids?: Array<string>): Promise<RoleCache | null> {
		const role = await this.storageEngine.find(fn, ids || null, super.buildId(guildId as string));
		if (!role) return null;
		return new RoleCache(this.storageEngine, this.rain).bindObject(role);
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

export default RoleCache;
