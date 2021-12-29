import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";

/**
 * Cache responsible for storing guild members
 */
class MemberCache extends BaseCache<import("discord-typings").MemberData & { guild_id?: string }> {
	public namespace: "member" = "member";
	public userCache: import("./UserCache");
	public boundGuild = "";
	public storageEngine: BaseStorageEngine<import("discord-typings").MemberData>;

	/**
	 * Creates a new MemberCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param storageEngine storage engine to use
	 * @param userCache user cache instance
	 * @param boundObject Bind an object to this instance
	 */
	public constructor(storageEngine: BaseStorageEngine<import("discord-typings").MemberData>, userCache: import("./UserCache"), rain: import("../RainCache")<any, any>, boundObject?: Partial<import("discord-typings").MemberData & { guild_id?: string }>) {
		super(rain);
		this.storageEngine = storageEngine;
		this.userCache = userCache;
		if (boundObject) this.bindObject(boundObject);
	}

	/**
	 * Get a member via id
	 * @param id id of the member
	 * @param guildId id of the guild of the member, defaults to the bound guild of the cache
	 * @returns bound member cache with properties of the member or null if no member is cached
	 */
	public async get(id: string, guildId: string | undefined = this.boundGuild): Promise<MemberCache | null> {
		if (this.boundObject) return this;
		const member = await this.storageEngine.get(this.buildId(id, guildId));
		if (!member) return null;

		return new MemberCache(this.storageEngine, this.userCache.bindUserId(id), this.rain, member);
	}

	/**
	 * Update data of a guild member
	 * @param id id of the member
	 * @param guildId id of the guild of the member, defaults to the bound guild of the cache
	 * @param data updated guild member data
	 */
	public async update(id: string, guildId: string | undefined = this.boundGuild, data: Partial<import("discord-typings").MemberData & import("discord-typings").UserData & { guild_id: string }>): Promise<MemberCache> {
		if (!guildId) throw new Error(`Empty guild id for member ${id}`);
		if (!data.guild_id) data.guild_id = guildId;
		if (!data.id) data.id = id;
		if (data.user) {
			await this.userCache.update(data.user.id, data.user);
		}
		if (this.boundObject) this.bindObject(data);
		await this.addToIndex(id, guildId);
		await this.storageEngine.upsert(this.buildId(id, guildId), this.structurize(data));
		if (this.boundObject) return this;
		return new MemberCache(this.storageEngine, this.userCache.bindUserId(data.id), this.rain, data);
	}

	/**
	 * Remove a member from the cache
	 * @param id id of the member
	 * @param guildId id of the guild of the member, defaults to the bound guild of the cache
	 */
	public async remove(id: string, guildId: string | undefined = this.boundGuild): Promise<void> {
		await this.removeFromIndex(id, guildId);
		return this.storageEngine.remove(this.buildId(id, guildId));
	}

	/**
	 * Filter for members by providing filter function which returns true upon success and false otherwise
	 * @param fn Filter function
	 * @param guildId guild id the member is in
	 */
	public async filter(fn: (member?: import("discord-typings").MemberData, index?: number, array?: Array<import("discord-typings").MemberData>) => unknown, guildId = this.boundGuild, ids: Array<string>): Promise<Array<MemberCache>> {
		const members = await this.storageEngine.filter(fn, ids, super.buildId(guildId as string));
		return members.map(m => new MemberCache(this.storageEngine, this.userCache.bindUserId((m as import("discord-typings").MemberData & { id: string }).id), this.rain, m).bindGuild(this.boundGuild));
	}

	/**
	 * Filter through the collection of members and return the first match
	 * @param fn Filter function
	 * @param guildId guild id the member is in
	 */
	public async find(fn: (member?: import("discord-typings").MemberData, index?: number, array?: Array<string>) => boolean, guildId = this.boundGuild, ids: Array<string> | undefined = undefined): Promise<MemberCache | null> {
		const member = await this.storageEngine.find(fn, ids, super.buildId(guildId as string));
		if (!member) return null;
		return new MemberCache(this.storageEngine, this.userCache.bindUserId((member as import("discord-typings").MemberData & { id: string }).id), this.rain, member);
	}

	/**
	 * Build a unique key for storing member data
	 * @param userId id of the user belonging to the member
	 * @param guildId - id of the guild the member+
	 */
	public buildId(userId: string, guildId?: string): string {
		if (!guildId) return super.buildId(userId);
		return `${this.namespace}.${guildId}.${userId}`;
	}
}

export = MemberCache;
