import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";

/**
 * Cache responsible for caching users
 */
class VoiceStateCache extends BaseCache<import("@amanda/discordtypings").VoiceStateData> {
	/**
	 * Create a new VoiceStateCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param storageEngine Storage engine to use for this cache
	 * @param boundObject Optional, may be used to bind a user object to the cache
	 */
	public constructor(storageEngine: BaseStorageEngine<import("@amanda/discordtypings").VoiceStateData>, boundObject?: import("@amanda/discordtypings").VoiceStateData) {
		super();
		this.storageEngine = storageEngine;
		this.namespace = "voicestates";
		if (boundObject) {
			this.bindObject(boundObject);
		}
	}
	/**
	 * Loads a VoiceState from the cache via id
	 * @param id discord id of the user
	 * @param guildId guild id
	 * @returns Returns a VoiceState Cache with a bound user or null if no user was found
	 */
	public async get(id = this.boundObject?.user_id, guildId: string): Promise<VoiceStateCache | null> {
		if (this.boundObject) {
			return this;
		}
		const state = await this.storageEngine?.get(this.buildId(id as string, guildId));
		if (!state) {
			return null;
		}
		return new VoiceStateCache(this.storageEngine as BaseStorageEngine<import("@amanda/discordtypings").VoiceStateData>, state);
	}

	/**
	 * Update a VoiceState entry in the cache
	 * @param id discord id of the user
	 * @param guildId guild id
	 * @param data updated data of the VoiceState, it will be merged with the old data
	 */
	public async update(id: string, guildId: string, data: import("@amanda/discordtypings").VoiceStateData): Promise<VoiceStateCache> {
		if (this.boundObject) {
			this.bindObject(data);
		}

		delete data.member;

		await this.addToIndex([id]);
		await this.storageEngine?.upsert(this.buildId(id, guildId), data);
		if (this.boundObject) return this;
		return new VoiceStateCache(this.storageEngine as BaseStorageEngine<import("@amanda/discordtypings").VoiceStateData>, data);
	}

	/**
	 * Remove a VoiceState from the cache
	 * @param id discord id of the user
	 * @param guildId guild id
	 */
	public async remove(id = this.boundObject?.user_id, guildId: string): Promise<void> {
		const state = await this.isIndexed(id as string, guildId);
		if (state) {
			await this.removeFromIndex(id as string, guildId);
			return this.storageEngine?.remove(this.buildId(id as string, guildId));
		} else {
			return undefined;
		}
	}

	/**
	 * Filter for VoiceStates by providing a filter function which returns true upon success and false otherwise
	 * @param fn filter function to use for the filtering
	 * @param ids Array of user ids, if omitted the global user index will be used
	 */
	public async filter(fn: (state?: import("@amanda/discordtypings").VoiceStateData, index?: number, array?: Array<import("@amanda/discordtypings").VoiceStateData>) => unknown, ids: Array<string> | undefined = undefined): Promise<Array<VoiceStateCache>> {
		const states = await this.storageEngine?.filter(fn, ids, this.namespace);
		if (!states) return [];
		return states.map(s => new VoiceStateCache(this.storageEngine as BaseStorageEngine<import("@amanda/discordtypings").VoiceStateData>, s));
	}

	/**
	 * Find a VoiceState by providing a filter function which returns true upon success and false otherwise
	 * @param fn filter function to use for filtering for a state
	 * @param ids List of ids that should be used as the scope of the filter
	 * @returns Returns a VoiceState Cache with a bound state or null if no state was found
	 */
	public async find(fn: (state?: import("@amanda/discordtypings").VoiceStateData, index?: number, array?: Array<string>) => unknown, ids: Array<string> | undefined = undefined): Promise<VoiceStateCache | null> {
		const state = await this.storageEngine?.find(fn, ids, this.namespace);
		if (!state) return null;
		return new VoiceStateCache(this.storageEngine as BaseStorageEngine<import("@amanda/discordtypings").VoiceStateData>, state);
	}

	/**
	 * Bind a user id to the cache
	 * @param userId id of the user
	 * @returns Returns a VoiceStateCache that has an id bound to it, which serves as the default argument to get, update and delete
	 */
	public bindUserId(userId: string): VoiceStateCache {
		// @ts-ignore
		this.user_id = userId;
		return this;
	}

	/**
	 * Remove a VoiceState from the index
	 * @param id id of the user
	 */
	public async removeFromIndex(id: string, guildId?: string): Promise<void> {
		return this.storageEngine?.removeFromList(this.namespace, this.buildId(id, guildId));
	}

	/**
	 * Check if a VoiceState is indexed
	 * @param id id of the user
	 * @return True if the state is indexed, false otherwise
	 */
	public async isIndexed(id: string, guildId?: string): Promise<boolean> {
		return this.storageEngine?.isListMember(this.namespace, this.buildId(id, guildId)) || false;
	}

	/**
	 * Get a list of currently indexed VoiceStates, since VoiceStates is a global namespace,
	 * this will return **ALL** VoiceStates that the bot cached currently
	 * @returns Array with a list of ids of users that are indexed
	 */
	public async getIndexMembers(): Promise<Array<string>> {
		return this.storageEngine?.getListMembers(this.namespace) || [];
	}

	/**
	 * Delete the VoiceState index, you should probably **not** use this function, but I won't stop you.
	 */
	public async removeIndex(): Promise<void> {
		return this.storageEngine?.removeList(this.namespace);
	}

	/**
	 * Get the number of VoiceStates that are currently cached
	 * @returns Number of VoiceStates currently cached
	 */
	public async getIndexCount(): Promise<number> {
		return this.storageEngine?.getListCount(this.namespace) || 0;
	}

	/**
	 * Build a unique key for storing VoiceState data
	 * @param userId id of the user
	 * @param guildId id of the guild
	 */
	public buildId(userId: string, guildId?: string): string {
		if (!guildId) {
			return super.buildId(userId);
		}
		return `${this.namespace}.${guildId}.${userId}`;
	}
}

export = VoiceStateCache;
