import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";

export type Member = import("discord-typings").Member & { id?: string; guild_id?: string }

/**
 * Cache responsible for storing guild members
 */
class MemberCache extends BaseCache<Member> {
	public namespace = "member" as const;
	public userCache: import("./UserCache").default;
	public boundGuild = "";

	/**
	 * Creates a new MemberCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param storageEngine storage engine to use
	 * @param userCache user cache instance
	 */
	public constructor(storageEngine: BaseStorageEngine<Member>, rain: import("../RainCache").default<any, any>, userCache: import("./UserCache").default) {
		super(storageEngine, rain);
		this.userCache = userCache;
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

		return new MemberCache(this.storageEngine, this.rain, this.userCache).bindObject(member);
	}

	/**
	 * Update data of a guild member
	 * @param id id of the member
	 * @param guildId id of the guild of the member, defaults to the bound guild of the cache
	 * @param memberData updated guild member data
	 */
	public async update(id: string, guildId: string | undefined = this.boundGuild, memberData: Partial<Member>): Promise<MemberCache> {
		if (this.rain.options.disabledCaches.member) return this;
		const data = Object.assign({}, memberData);
		if (!guildId) throw new Error(`Empty guild id for member ${id}`);
		if (!data.guild_id) data.guild_id = guildId;
		if (!data.id) data.id = id;
		if (data.user) {
			await this.userCache.update(data.user.id, data.user);
			delete data.user;
		}
		if (this.boundObject) this.bindObject(data);
		await this.addToIndex([id], guildId);
		const old = await this.storageEngine.upsert(this.buildId(id, guildId), this.structurize(data));
		if (this.boundObject) return this;
		return new MemberCache(this.storageEngine, this.rain, this.userCache).bindObject(data, old);
	}

	/**
	 * Remove a member from the cache
	 * @param id id of the member
	 * @param guildId id of the guild of the member, defaults to the bound guild of the cache
	 */
	public async remove(id: string, guildId: string | undefined = this.boundGuild): Promise<void> {
		await this.removeFromIndex(id, guildId);
		await this.storageEngine.remove(this.buildId(id, guildId));
	}

	/**
	 * Filter for members by providing filter function which returns true upon success and false otherwise
	 * @param fn Filter function
	 * @param guildId guild id the member is in
	 */
	public async filter(fn: (member: Member, index: number) => boolean, guildId = this.boundGuild, ids?: Array<string>): Promise<Array<MemberCache>> {
		const members = await this.storageEngine.filter(fn, ids || null, super.buildId(guildId as string));
		return members.map(m => new MemberCache(this.storageEngine, this.rain, this.userCache).bindGuild(this.boundGuild).bindObject(m));
	}

	/**
	 * Filter through the collection of members and return the first match
	 * @param fn Filter function
	 * @param guildId guild id the member is in
	 */
	public async find(fn: (member: import("discord-typings").Member, index: number,) => boolean, guildId = this.boundGuild, ids?: Array<string>): Promise<MemberCache | null> {
		const member = await this.storageEngine.find(fn, ids || null, super.buildId(guildId as string));
		if (!member) return null;
		return new MemberCache(this.storageEngine, this.rain, this.userCache).bindObject(member);
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

export default MemberCache;
