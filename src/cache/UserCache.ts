import BaseCache from "./BaseCache";

/**
 * Cache responsible for caching users
 */
class UserCache extends BaseCache<import("discord-typings").User> {
	public namespace = "user" as const;

	/**
	 * Loads a user from the cache via id
	 * @param id discord id of the user
	 * @returns Returns a User Cache with a bound user or null if no user was found
	 */
	public async get(id = this.boundObject?.id): Promise<UserCache | null> {
		if (this.boundObject) return this;
		const user = await this.storageEngine.get(this.buildId(id as string));
		if (!user) return null;
		return new UserCache(this.storageEngine, this.rain).bindObject(user);
	}

	/**
	 * Update a user entry in the cache
	 * @param id discord id of the user
	 * @param data updated data of the user, it will be merged with the old data
	 */
	public async update(id = this.boundObject?.id, data: Partial<import("discord-typings").User>): Promise<UserCache> {
		if (this.rain.options.disabledCaches.user) return this;
		if (this.boundObject) this.bindObject(data);
		await this.addToIndex([id as string]);
		const old = await this.storageEngine.upsert(this.buildId(id as string), this.structurize(data));
		if (this.boundObject) return this;
		return new UserCache(this.storageEngine, this.rain).bindObject(data, old);
	}

	/**
	 * Remove a user from the cache
	 * @param id discord id of the user
	 */
	public async remove(id = this.boundObject?.id): Promise<void> {
		await this.removeFromIndex(id as string);
		await this.storageEngine.remove(this.buildId(id as string));
	}

	/**
	 * Filter for users by providing a filter function which returns true upon success and false otherwise
	 * @param fn filter function to use for the filtering
	 * @param ids Array of user ids, if omitted the global user index will be used
	 */
	public async filter(fn: (user: import("discord-typings").User, index: number) => boolean, ids?: Array<string>): Promise<Array<UserCache>> {
		const users = await this.storageEngine.filter(fn, ids || null, this.namespace);
		return users.map(u => new UserCache(this.storageEngine, this.rain).bindObject(u));
	}

	/**
	 * Find a user by providing a filter function which returns true upon success and false otherwise
	 * @param fn filter function to use for filtering for a user
	 * @param ids List of ids that should be used as the scope of the filter
	 * @returns Returns a User Cache with a bound user or null if no user was found
	 */
	public async find(fn: (user: import("discord-typings").User, index: number) => boolean, ids?: Array<string>): Promise<UserCache | null> {
		const user = await this.storageEngine.find(fn, ids || null, this.namespace);
		if (!user) return null;
		return new UserCache(this.storageEngine, this.rain).bindObject(user);
	}

	/**
	 * Add users to the index
	 * @param ids ids of the users
	 */
	public async addToIndex(ids: Array<string>): Promise<void> {
		await this.storageEngine.addToList(this.namespace, ids);
	}

	/**
	 * Remove a user from the index
	 * @param id id of the user
	 */
	public async removeFromIndex(id: string): Promise<void> {
		await this.storageEngine.removeFromList(this.namespace, [id]);
	}

	/**
	 * Check if a user is indexed
	 * @paramid id of the user
	 * @returns True if the user is indexed, false otherwise
	 */
	public async isIndexed(id: string): Promise<boolean> {
		return this.storageEngine.isListMember(this.namespace, id);
	}

	/**
	 * Get a list of currently indexed users, since users is a global namespace,
	 * this will return **ALL** users that the bot cached currently
	 * @returns Array with a list of ids of users that are indexed
	 */
	public async getIndexMembers(): Promise<Array<string>> {
		return this.storageEngine.getListMembers(this.namespace);
	}

	/**
	 * Delete the user index, you should probably **not** use this function, but I won't stop you.
	 */
	public async removeIndex(): Promise<void> {
		await this.storageEngine.removeList(this.namespace);
	}

	/**
	 * Get the number of users that are currently cached
	 * @returns Number of users currently cached
	 */
	public async getIndexCount(): Promise<number> {
		return this.storageEngine.getListCount(this.namespace);
	}
}

export default UserCache;
