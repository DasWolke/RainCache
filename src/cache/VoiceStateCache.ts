import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";

/**
 * Cache responsible for caching users
 */
class VoiceStateCache extends BaseCache<import("discord-typings").VoiceState> {
	public namespace = "voicestates" as const;
	public memberCache: import("./MemberCache").default;

	/**
	 * Create a new VoiceStateCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param storageEngine Storage engine to use for this cache
	 */
	public constructor(storageEngine: BaseStorageEngine<import("discord-typings").VoiceState>, rain: import("../RainCache").default<any, any>, memberCache: import("./MemberCache").default) {
		super(storageEngine, rain);
		this.memberCache = memberCache;
	}

	/**
	 * Loads a VoiceState from the cache via id
	 * @param id discord id of the user
	 * @param guildId guild id
	 * @returns Returns a VoiceState Cache with a bound user or null if no user was found
	 */
	public async get(id = this.boundObject?.user_id as string, guildId: string): Promise<VoiceStateCache | null> {
		if (this.boundObject) return this;
		const state = await this.storageEngine.get(this.buildId(id, guildId));
		if (!state) return null;
		return new VoiceStateCache(this.storageEngine, this.rain, this.memberCache).bindObject(state);
	}

	/**
	 * Update a VoiceState entry in the cache
	 * @param id discord id of the user
	 * @param guildId guild id
	 * @param stateData updated data of the VoiceState, it will be merged with the old data
	 */
	public async update(id: string, guildId: string, stateData: Partial<import("discord-typings").VoiceState>): Promise<VoiceStateCache> {
		if (this.rain.options.disabledCaches.voiceState) return this;
		const data = Object.assign({}, stateData);
		if (!data.guild_id) data.guild_id = guildId;
		if (this.boundObject) this.bindObject(data);
		if (data.member) {
			this.memberCache.update(id, guildId, data.member);
			delete data.member;
		}

		await this.addToIndex([this.buildId(id, guildId)]);
		const old = await this.storageEngine.upsert(this.buildId(id, guildId), this.structurize(data));
		if (this.boundObject) return this;
		return new VoiceStateCache(this.storageEngine, this.rain, this.memberCache).bindObject(data, old);
	}

	/**
	 * Remove a VoiceState from the cache
	 * @param id discord id of the user
	 * @param guildId guild id
	 */
	public async remove(id = this.boundObject?.user_id as string, guildId: string): Promise<void> {
		await this.removeFromIndex(id, guildId);
		await this.storageEngine.remove(this.buildId(id, guildId));
	}

	/**
	 * Filter for VoiceStates by providing a filter function which returns true upon success and false otherwise
	 * @param fn filter function to use for the filtering
	 * @param ids Array of user ids, if omitted the global user index will be used
	 */
	public async filter(fn: (state: import("discord-typings").VoiceState, index: number) => boolean, ids?: Array<string>): Promise<Array<VoiceStateCache>> {
		const states = await this.storageEngine.filter(fn, ids || null, this.namespace);
		return states.map(s => new VoiceStateCache(this.storageEngine, this.rain, this.memberCache).bindObject(s));
	}

	/**
	 * Find a VoiceState by providing a filter function which returns true upon success and false otherwise
	 * @param fn filter function to use for filtering for a state
	 * @param ids List of ids that should be used as the scope of the filter
	 * @returns Returns a VoiceState Cache with a bound state or null if no state was found
	 */
	public async find(fn: (state: import("discord-typings").VoiceState, index: number) => boolean, ids?: Array<string>): Promise<VoiceStateCache | null> {
		const state = await this.storageEngine.find(fn, ids || null, this.namespace);
		if (!state) return null;
		return new VoiceStateCache(this.storageEngine, this.rain, this.memberCache).bindObject(state);
	}

	/**
	 * Add a voice state to the voicestates index
	 * @param ids ids of the voice states
	 */
	public async addToIndex(ids: Array<string>): Promise<void> {
		await this.storageEngine.addToList(this.namespace, ids);
	}

	/**
	 * Remove a VoiceState from the index
	 * @param id id of the user
	 */
	public async removeFromIndex(id: string, guildId?: string): Promise<void> {
		await this.storageEngine.removeFromList(this.namespace, [this.buildId(id, guildId)]);
	}

	/**
	 * Check if a VoiceState is indexed
	 * @param id id of the user
	 * @return True if the state is indexed, false otherwise
	 */
	public async isIndexed(id: string, guildId?: string): Promise<boolean> {
		return this.storageEngine.isListMember(this.namespace, this.buildId(id, guildId));
	}

	/**
	 * Get a list of currently indexed VoiceStates, since VoiceStates is a global namespace,
	 * this will return **ALL** VoiceStates that the bot cached currently
	 * @returns Array with a list of ids of users that are indexed
	 */
	public async getIndexMembers(): Promise<Array<string>> {
		return this.storageEngine.getListMembers(this.namespace);
	}

	/**
	 * Delete the VoiceState index, you should probably **not** use this function, but I won't stop you.
	 */
	public async removeIndex(): Promise<void> {
		await this.storageEngine.removeList(this.namespace);
	}

	/**
	 * Get the number of VoiceStates that are currently cached
	 * @returns Number of VoiceStates currently cached
	 */
	public async getIndexCount(): Promise<number> {
		return this.storageEngine.getListCount(this.namespace);
	}

	/**
	 * Build a unique key for storing VoiceState data
	 * @param userId id of the user
	 * @param guildId id of the guild
	 */
	public buildId(userId: string, guildId?: string): string {
		if (!guildId) return super.buildId(userId);
		return `${this.namespace}.${guildId}.${userId}`;
	}
}

export default VoiceStateCache;
