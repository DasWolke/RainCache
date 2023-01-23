import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";

/**
 * Cache responsible for storing presence related data
 */
class PresenceCache extends BaseCache<import("discord-typings").PresenceUpdate> {
	public namespace = "presence" as const;
	public userCache: import("./UserCache").default;

	/**
	 * Create a new Presence Cache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param storageEngine Storage engine to use for this cache
	 */
	public constructor(storageEngine: BaseStorageEngine<import("discord-typings").PresenceUpdate>, rain: import("../RainCache").default<any, any>, userCache: import("./UserCache").default) {
		super(storageEngine, rain);
		this.userCache = userCache;
	}

	/**
	 * Get a presence via user id
	 * @param id id of a discord user
	 * @returns Returns a new PresenceCache with bound data or null if nothing was found
	 */
	public async get(id: string): Promise<PresenceCache | null> {
		if (this.boundObject) return this;
		const presence = await this.storageEngine.get(this.buildId(id));
		if (presence) return new PresenceCache(this.storageEngine, this.rain, this.userCache).bindObject(presence);
		else return null;
	}

	/**
	 * Upsert the presence of a user.
	 *
	 * **This function automatically removes the guild_id, roles and user of a presence update before saving it**
	 * @param id id of the user the presence belongs to
	 * @param presenceData updated presence data of the user
	 * @returns returns a bound presence cache
	 */
	public async update(id: string, presenceData: Partial<import("discord-typings").PresenceUpdate>): Promise<PresenceCache> {
		if (this.rain.options.disabledCaches.presence) return this;
		const data = Object.assign({}, presenceData);
		if (this.boundObject) this.bindObject(data);
		if (data.guild_id) delete data.guild_id;
		if (data.user) {
			await this.userCache.update(data.user.id, data.user);
			delete data.user;
		}
		const old = await this.storageEngine.upsert(this.buildId(id), this.structurize(data));
		if (this.boundObject) return this;
		return new PresenceCache(this.storageEngine, this.rain, this.userCache).bindObject(data, old);
	}

	/**
	 * Remove a stored presence from the cache
	 * @param id id of the user the presence belongs to
	 */
	public async remove(id: string): Promise<void> {
		await this.storageEngine.remove(this.buildId(id));
	}
}

export default PresenceCache;
