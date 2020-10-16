import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";

/**
 * Cache responsible for storing guild members
 */
class MemberCache extends BaseCache<import("@amanda/discordtypings").MemberData> {
	public namespace: "member";
	public user: import("./UserCache");

	/**
	 * Creates a new MemberCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param storageEngine storage engine to use
	 * @param userCache user cache instance
	 * @param boundObject Bind an object to this instance
	 */
	public constructor(storageEngine: BaseStorageEngine<import("@amanda/discordtypings").MemberData>, userCache: import("./UserCache"), boundObject?: import("@amanda/discordtypings").MemberData) {
		super();
		this.storageEngine = storageEngine;
		this.namespace = "member";
		this.user = userCache;
		this.boundGuild = "";
		if (boundObject) {
			this.bindObject(boundObject);
		}
	}

	/**
	 * Get a member via id
	 * @param id id of the member
	 * @param guildId id of the guild of the member, defaults to the bound guild of the cache
	 * @returns bound member cache with properties of the member or null if no member is cached
	 */
	public async get(id: string, guildId: string = this.boundGuild): Promise<MemberCache | null> {
		if (this.boundObject) {
			return this;
		}
		const member = await this.storageEngine.get(this.buildId(id, guildId));
		if (!member) {
			return null;
		}
		// @ts-ignore
		return new MemberCache(this.storageEngine, this.user.bindUserId(member.id), member);
	}

	/**
	 * Update data of a guild member
	 * @param id id of the member
	 * @param guildId id of the guild of the member, defaults to the bound guild of the cache
	 * @param data updated guild member data
	 */
	public async update(id: string, guildId: string = this.boundGuild, data: import("@amanda/discordtypings").MemberData): Promise<MemberCache> {
		if (this.boundObject) {
			this.bindObject(data);
		}
		if (!guildId) {
			throw new Error(`Empty guild id for member ${id}`);
		}
		// @ts-ignore
		if (!data.guild_id) {
			// @ts-ignore
			data.guild_id = guildId;
		}
		// @ts-ignore
		if (!data.id) {
			// @ts-ignore
			data.id = id;
		}
		// @ts-ignore
		if (data.user) {
			// @ts-ignore
			await this.user.update(data.user.id, data.user);
			// @ts-ignore
			delete data.user;
		}
		await this.addToIndex([id], guildId);
		await this.storageEngine.upsert(this.buildId(id, guildId), data);
		if (this.boundObject) return this;
		// @ts-ignore
		return new MemberCache(this.storageEngine, this.user.bindUserId(data.id), data);
	}

	/**
	 * Remove a member from the cache
	 * @param id id of the member
	 * @param guildId id of the guild of the member, defaults to the bound guild of the cache
	 */
	public async remove(id: string, guildId: string = this.boundGuild): Promise<void> {
		const member = await this.storageEngine.get(this.buildId(id, guildId));
		if (member) {
			await this.removeFromIndex(id, guildId);
			return this.storageEngine.remove(this.buildId(id, guildId));
		} else {
			return null;
		}
	}

	/**
	 * Filter for members by providing filter function which returns true upon success and false otherwise
	 * @param fn Filter function
	 * @param guildId guild id the member is in
	 */
	public async filter(fn: (member?: import("@amanda/discordtypings").MemberData, index?: number, array?: Array<import("@amanda/discordtypings").MemberData>) => unknown, guildId = this.boundGuild, ids: Array<string> = null): Promise<Array<MemberCache>> {
		const members = await this.storageEngine.filter(fn, ids, super.buildId(guildId));
		// @ts-ignore
		return members.map(m => new MemberCache(this.storageEngine, this.user.bindUserId(m.id), m).bindGuild(this.boundGuild));
	}

	/**
	 *
	 * @param fn Filter function
	 * @param guildId guild id the member is in
	 */
	public async find(fn: (member?: import("@amanda/discordtypings").MemberData, index?: number, array?: Array<string>) => boolean, guildId = this.boundGuild, ids = null): Promise<MemberCache | null> {
		const member = await this.storageEngine.find(fn, ids, super.buildId(guildId));
		if (!member) return null;
		// @ts-ignore
		return new MemberCache(this.storageEngine, this.user.bindUserId(member.id), member);
	}

	/**
	 * Build a unique key for storing member data
	 * @param userId id of the user belonging to the member
	 * @param guildId - id of the guild the member+
	 */
	public buildId(userId: string, guildId?: string): string {
		if (!guildId) {
			return super.buildId(userId);
		}
		return `${this.namespace}.${guildId}.${userId}`;
	}
}

export = MemberCache;
