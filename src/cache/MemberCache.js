const BaseCache = require("./BaseCache");

/**
 * Cache responsible for storing guild members
 */
class MemberCache extends BaseCache {
	/**
	 * Creates a new MemberCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param {Object} storageEngine - storage engine to use
	 * @param {import("./UserCache")} userCache - user cache instance
	 * @param {Object} [boundObject] - Bind an object to this instance
	 */
	constructor(storageEngine, userCache, boundObject) {
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
	 * @param {string} id - id of the member
	 * @param {string} [guildId=this.boundGuild] - id of the guild of the member, defaults to the bound guild of the cache
	 * @returns {Promise<?MemberCache>} - bound member cache with properties of the member or null if no member is cached
	 */
	async get(id, guildId = this.boundGuild) {
		if (this.boundObject) {
			return this.boundObject;
		}
		const member = await this.storageEngine.get(this.buildId(id, guildId));
		if (!member) {
			return null;
		}
		return new MemberCache(this.storageEngine, this.user.bindUserId(member.id), member);
	}

	/**
	 * Update data of a guild member
	 * @param {string} id - id of the member
	 * @param {string} guildId=this.boundGuild - id of the guild of the member, defaults to the bound guild of the cache
	 * @param {GuildMember} data - updated guild member data
	 * @returns {Promise<MemberCache>}
	 */
	async update(id, guildId = this.boundGuild, data) {
		if (this.boundObject) {
			this.bindObject(data);
			await this.update(this.boundObject.id, this.boundObject.guild_id, data);
			return this;
		}
		if (!guildId) {
			throw new Error(`Empty guild id for member ${id}`);
		}
		if (!data.guild_id) {
			data.guild_id = guildId;
		}
		if (!data.id) {
			data.id = id;
		}
		if (data.user) {
			await this.user.update(data.user.id, data.user);
			delete data.user;
		}
		await this.addToIndex(id, guildId);
		await this.storageEngine.upsert(this.buildId(id, guildId), data);
		return new MemberCache(this.storageEngine, this.user.bindUserId(data.id), data);
	}

	/**
	 * Remove a member from the cache
	 * @param {string} id - id of the member
	 * @param {string} [guildId=this.boundGuild] - id of the guild of the member, defaults to the bound guild of the cache
	 * @return {Promise<void>}
	 */
	async remove(id, guildId = this.boundGuild) {
		if (this.boundObject) {
			return this.remove(this.boundObject.id, this.boundObject.guild_id);
		}
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
	 * @param {(member: import("@amanda/discordtypings").MemberData) => boolean} fn
	 * @param guildId
	 * @param ids
	 * @return {Promise<Array<MemberCache>>}
	 */
	async filter(fn, guildId = this.boundGuild, ids = null) {
		const members = await this.storageEngine.filter(fn, ids, super.buildId(guildId));
		return members.map(m => new MemberCache(this.storageEngine, this.user.bindUserId(m.id), m).bindGuild(this.boundGuild));
	}

	/**
	 *
	 * @param {(member: import("@amanda/discordtypings").MemberData) => boolean} fn
	 * @param guildId
	 * @param ids
	 * @return {Promise<MemberCache>}
	 */
	async find(fn, guildId = this.boundGuild, ids = null) {
		const member = await this.storageEngine.find(fn, ids, super.buildId(guildId));
		return new MemberCache(this.storageEngine, this.user.bindUserId(member.id), member);
	}

	/**
	 * Build a unique key for storing member data
	 * @param {string} userId - id of the user belonging to the member
	 * @param {string} guildId - id of the guild the member+
	 * @return {any}
	 */
	// @ts-ignore
	buildId(userId, guildId) {
		if (!guildId) {
			return super.buildId(userId);
		}
		return `${this.namespace}.${guildId}.${userId}`;
	}

}

/**
 * @typedef {Object} GuildMember
 * @property {import("@amanda/discordtypings").UserData} user - user belonging to the member
 * @property {?string} nick - nickname if the member has one
 * @property {Array<string>} roles - array of role ids
 * @property {string} joined_at - timestamp when the user joined the guild
 * @property {boolean} deaf - if the user is deafened
 * @property {boolean} mute - if the user is muted
 * @property {string} id - id of the user belonging to the guild member, only available with raincache
 * @property {string} guild_id - id of the guild the user is a member of, only available with raincache
 */

module.exports = MemberCache;
