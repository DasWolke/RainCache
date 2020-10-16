import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";

/**
 * Cache responsible for caching users
 * @extends BaseCache
 */
class UserCache extends BaseCache<import("@amanda/discordtypings").UserData> {
	/**
	 * Create a new UserCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param storageEngine Storage engine to use for this cache
	 * @param boundObject Optional, may be used to bind a user object to the cache
	 */
	public constructor(storageEngine: BaseStorageEngine<import("@amanda/discordtypings").UserData>, boundObject?: import("@amanda/discordtypings").UserData) {
		super();
		this.storageEngine = storageEngine;
		this.namespace = "user";
		if (boundObject) {
			this.bindObject(boundObject);
		}
	}

	/**
	 * Loads a user from the cache via id
	 * @param id discord id of the user
	 * @returns Returns a User Cache with a bound user or null if no user was found
	 */
	public async get(id: string = this.boundObject?.id): Promise<UserCache | null> {
		if (this.boundObject) {
			return this;
		}
		const user = await this.storageEngine.get(this.buildId(id));
		if (!user) {
			return null;
		}
		return new UserCache(this.storageEngine, user);
	}

	/**
	 * Update a user entry in the cache
	 * @param id discord id of the user
	 * @param data - updated data of the user, it will be merged with the old data
	 */
	public async update(id: string = this.boundObject?.id, data: import("@amanda/discordtypings").UserData): Promise<UserCache> {
		if (this.boundObject) {
			this.bindObject(data);
		}
		await this.addToIndex([id]);
		await this.storageEngine.upsert(this.buildId(id), data);
		if (this.boundObject) return this;
		return new UserCache(this.storageEngine, data);
	}

	/**
	 * Remove a user from the cache
	 * @param {string} id=this.id - discord id of the user
	 */
	public async remove(id: string = this.boundObject?.id): Promise<void> {
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
	 * @param fn filter function to use for the filtering
	 * @param ids Array of user ids, if omitted the global user index will be used
	 */
	public async filter(fn: (user?: import("@amanda/discordtypings").UserData, index?: number, array?: Array<import("@amanda/discordtypings").UserData>) => unknown, ids: Array<string> = null): Promise<Array<UserCache>> {
		const users = await this.storageEngine.filter(fn, ids, this.namespace);
		return users.map(u => new UserCache(this.storageEngine, u));
	}

	/**
	 * Find a user by providing a filter function which returns true upon success and false otherwise
	 * @param fn filter function to use for filtering for a user
	 * @param ids List of ids that should be used as the scope of the filter
	 * @returns Returns a User Cache with a bound user or null if no user was found
	 */
	public async find(fn: (user?: import("@amanda/discordtypings").UserData, index?: number, array?: Array<string>) => unknown, ids: Array<string> = null): Promise<UserCache | null> {
		const user = await this.storageEngine.find(fn, ids, this.namespace);
		if (!user) return null;
		return new UserCache(this.storageEngine, user);
	}

	/**
	 * Bind a user id to the cache, used by the member cache
	 * @param userId id of the user
	 * @returns Returns a UserCache that has an id bound to it, which serves as the default argument to get, update and delete
	 */
	public bindUserId(userId: string): UserCache {
		// @ts-ignore
		this.id = userId;
		return this;
	}

	/**
	 * Add users to the index
	 * @param ids ids of the users
	 */
	public async addToIndex(ids: Array<string>): Promise<void> {
		return this.storageEngine.addToList(this.namespace, ids);
	}

	/**
	 * Remove a user from the index
	 * @param id id of the user
	 */
	public async removeFromIndex(id: string): Promise<void> {
		return this.storageEngine.removeFromList(this.namespace, id);
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
		return this.storageEngine.removeList(this.namespace);
	}

	/**
	 * Get the number of users that are currently cached
	 * @returns Number of users currently cached
	 */
	public async getIndexCount(): Promise<number> {
		return this.storageEngine.getListCount(this.namespace);
	}
}

export = UserCache;
