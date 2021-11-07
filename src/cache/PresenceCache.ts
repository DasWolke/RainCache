import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";

/**
 * Cache responsible for storing presence related data
 */
class PresenceCache extends BaseCache<import("discord-typings").PresenceData> {
	public namespace: "presence";
	public userCache: import("./UserCache");

	/**
	 * Create a new Presence Cache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param storageEngine Storage engine to use for this cache
	 * @param boundObject Optional, may be used to bind a presence object to the cache
	 */
	public constructor(storageEngine: BaseStorageEngine<import("discord-typings").PresenceData>, userCache: import("./UserCache"), rain: import("../RainCache")<any, any>, boundObject?: import("discord-typings").PresenceData) {
		super(rain);
		this.storageEngine = storageEngine;
		this.namespace = "presence";
		this.userCache = userCache;
		if (boundObject) {
			this.bindObject(boundObject);
		}
	}

	/**
	 * Get a presence via user id
	 * @param id id of a discord user
	 * @returns Returns a new PresenceCache with bound data or null if nothing was found
	 */
	public async get(id: string): Promise<PresenceCache | null> {
		if (this.boundObject) {
			return this;
		}
		const presence = await this.storageEngine?.get(this.buildId(id));
		if (presence) {
			return new PresenceCache(this.storageEngine as BaseStorageEngine<import("discord-typings").PresenceData>, this.userCache.bindUserId(id), this.rain, presence);
		} else {
			return null;
		}
	}

	/**
	 * Upsert the presence of a user.
	 *
	 * **This function automatically removes the guild_id, roles and user of a presence update before saving it**
	 * @param id id of the user the presence belongs to
	 * @param data updated presence data of the user
	 * @returns returns a bound presence cache
	 */
	public async update(id: string, data: Partial<import("discord-typings").PresenceData>): Promise<PresenceCache> {
		if (this.boundObject) {
			this.bindObject(data);
		}
		if (data.guild_id) {
			delete data.guild_id;
		}
		if (data.roles) {
			delete data.roles;
		}
		if (data.user) {
			await this.userCache.update(data.user.id, data.user);
			delete data.user;
		}
		await this.storageEngine?.upsert(this.buildId(id), this.structurize(data));
		if (this.boundObject) return this;
		return new PresenceCache(this.storageEngine as BaseStorageEngine<import("discord-typings").PresenceData>, this.userCache, this.rain, data as import("discord-typings").PresenceData);
	}

	/**
	 * Remove a stored presence from the cache
	 * @param id id of the user the presence belongs to
	 */
	public async remove(id: string): Promise<void> {
		const presence = await this.storageEngine?.get(this.buildId(id));
		if (presence) {
			return this.storageEngine?.remove(this.buildId(id));
		} else {
			return undefined;
		}
	}
}

export = PresenceCache;
