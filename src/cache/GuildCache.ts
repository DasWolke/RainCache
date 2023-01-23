/* eslint-disable @typescript-eslint/no-non-null-assertion */
import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";

/**
 * Cache responsible for guilds
 */
class GuildCache extends BaseCache<import("discord-typings").Guild> {
	public channelCache: import("./ChannelCache").default;
	public roleCache: import("./RoleCache").default;
	public memberCache: import("./MemberCache").default;
	public emojiCache: import("./EmojiCache").default;
	public presenceCache: import("./PresenceCache").default;
	public guildChannelMap: import("./ChannelMapCache").default;
	public namespace = "guild" as const;

	/**
	 * Create a new GuildCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param storageEngine Storage engine to use for this cache
	 * @param channelCache Instantiated ChannelCache class
	 * @param roleCache Instantiated RoleCache class
	 * @param memberCache Instantiated MemberCache class
	 * @param emojiCache Instantiated EmojiCache class
	 * @param presenceCache Instantiated PresenceCache class
	 * @param guildToChannelCache Instantiated ChannelMap class
	 */
	public constructor(storageEngine: BaseStorageEngine<import("discord-typings").Guild>, rain: import("../RainCache").default<any, any>, channelCache: import("./ChannelCache").default, roleCache: import("./RoleCache").default, memberCache: import("./MemberCache").default, emojiCache: import("./EmojiCache").default, presenceCache: import("./PresenceCache").default, guildToChannelCache: import("./ChannelMapCache").default) {
		super(storageEngine, rain);
		this.storageEngine = storageEngine;
		this.channelCache = channelCache;
		this.roleCache = roleCache;
		this.memberCache = memberCache;
		this.emojiCache = emojiCache;
		this.presenceCache = presenceCache;
		this.guildChannelMap = guildToChannelCache;
	}

	/**
	 * Retrieves a guild via id
	 * @param id Discord id of the guild
	 * @returns Returns either a Guild Object or null if the guild does not exist.
	 */
	public async get(id: string): Promise<GuildCache | null> {
		if (this.boundObject) return this;
		const guild = await this.storageEngine.get(this.buildId(id));
		if (!guild) return null;
		return new GuildCache(this.storageEngine, this.rain, this.channelCache.bindGuild(guild.id), this.roleCache.bindGuild(guild.id), this.memberCache.bindGuild(guild.id), this.emojiCache.bindGuild(guild.id), this.presenceCache.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id)).bindObject(guild);
	}

	/**
	 * Upsert a guild object
	 * @param id id of the guild
	 * @param guildData data received from the event
	 * @returns returns a bound guild cache
	 */
	public async update(id: string, guildData: Partial<import ("discord-typings").Guild>): Promise<GuildCache> {
		if (this.rain.options.disabledCaches.guild) return this;
		const data = Object.assign({}, guildData);
		if (this.boundObject) this.bindObject(data); // using bindobject() to assure the data of the class is valid
		if ((data.channels && data.channels.length > 0) || (data.threads && data.threads.length)) {
			await this.guildChannelMap.update(id, (data.channels || data.threads)!.map((c: import("discord-typings").GuildChannel | import("discord-typings").ThreadChannel) => c.id));
			for (const channel of (data.channels || data.threads)!) {
				channel.guild_id = id;
				await this.channelCache.update(channel.id, channel);
			}
		}

		if (data.members && data.members.length > 0) {
			const membersPromiseBatch = [] as Array<Promise<import("./MemberCache").default>>;
			for (const member of data.members) {
				(member as import("discord-typings").Member & import("discord-typings").User & { guild_id: string }).guild_id = id;
				membersPromiseBatch.push(this.memberCache.update(member.user!.id, id, member));
			}
			await Promise.all(membersPromiseBatch);
		}

		if (data.presences && data.presences.length > 0) {
			const presencePromiseBatch = [] as Array<Promise<import("./PresenceCache").default>>;
			for (const presence of data.presences) {
				presencePromiseBatch.push(this.presenceCache.update(presence.user.id, presence));
			}
			await Promise.all(presencePromiseBatch);
		}

		if (data.roles && data.roles.length > 0) {
			const rolePromiseBatch = [] as Array<Promise<import("./RoleCache").default>>;
			for (const role of data.roles) {
				rolePromiseBatch.push(this.roleCache.update(role.id, id, role));
			}
			await Promise.all(rolePromiseBatch);
		}

		if (data.emojis && data.emojis.length > 0) {
			const emojiPromiseBatch: Array<Promise<any>> = [];
			for (const emoji of data.emojis) {
				emojiPromiseBatch.push(this.emojiCache.update(emoji.id as string, id, emoji));
			}
			await Promise.all(emojiPromiseBatch);
		}

		if (data.voice_states && data.voice_states.length > 0) {
			const voicePromiseBatch: Array<Promise<any>> = [];
			for (const state of data.voice_states) {
				if (!state.guild_id) state.guild_id = id;
				voicePromiseBatch.push(this.rain.cache.voiceState.update(state.user_id, id, state));
			}
			await Promise.all(voicePromiseBatch);
		}

		delete data.members;
		delete data.voice_states;
		delete data.roles;
		delete data.presences;
		delete data.emojis;
		delete data.channels;
		delete data.voice_states;
		await this.addToIndex([id]);
		const old = await this.storageEngine.upsert(this.buildId(id), this.structurize(data));
		if (this.boundObject) return this;
		return new GuildCache(this.storageEngine, this.rain, this.channelCache.bindGuild(id), this.roleCache.bindGuild(id), this.memberCache.bindGuild(id), this.emojiCache.bindGuild(id), this.presenceCache.bindGuild(id), this.guildChannelMap.bindGuild(id)).bindObject(data, old);
	}

	/**
	 * Removes a guild and associated elements from the cache.
	 * @param id id of the guild to remove
	 */
	public async remove(id: string): Promise<void> {
		const channelMap = await this.guildChannelMap.get(id);
		const roles = await this.roleCache.getIndexMembers(id);
		const emojis = await this.emojiCache.getIndexMembers(id);
		const members = await this.memberCache.getIndexMembers(id);
		for (const emoji of emojis) {
			await this.emojiCache.remove(emoji, id);
		}

		for (const role of roles) {
			await this.roleCache.remove(role, id);
		}

		for (const channel of channelMap?.boundObject!.channels || []) {
			await this.channelCache.remove(channel);
		}

		for (const member of members) {
			await this.memberCache.remove(member, id);
		}

		await this.guildChannelMap.remove(id);
		await this.removeFromIndex(id);
		await this.storageEngine.remove(this.buildId(id));
	}

	/**
	 * Filter through the collection of guilds
	 * @param fn Filter function
	 * @returns array of bound guild caches
	 */
	public async filter(fn: (guild: import("discord-typings").Guild, index: number) => boolean): Promise<Array<GuildCache>> {
		const guilds = await this.storageEngine.filter(fn, null, this.namespace);
		return guilds.map(g => new GuildCache(this.storageEngine, this.rain, this.channelCache, this.roleCache.bindGuild(g.id), this.memberCache.bindGuild(g.id), this.emojiCache.bindGuild(g.id), this.presenceCache.bindGuild(g.id), this.guildChannelMap.bindGuild(g.id)).bindObject(g));
	}

	/**
	 * Filter through the collection of guilds and return the first match
	 * @param fn Filter function
	 * @returns returns a bound guild cache
	 */
	public async find(fn: (guild: import("discord-typings").Guild, index: number) => boolean): Promise<GuildCache | null> {
		const guild = await this.storageEngine.find(fn, null, this.namespace);
		if (!guild) return null;
		return new GuildCache(this.storageEngine, this.rain, this.channelCache.bindGuild(guild.id), this.roleCache.bindGuild(guild.id), this.memberCache.bindGuild(guild.id), this.emojiCache.bindGuild(guild.id), this.presenceCache.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id)).bindObject(guild);
	}

	/**
	 * Add a guild to the guild index
	 * @param ids ids of the guilds
	 */
	public async addToIndex(ids: Array<string>): Promise<void> {
		await this.storageEngine.addToList(this.namespace, ids);
	}

	/**
	 * Remove a guild from the guild index
	 * @param id id of the guild
	 */
	public async removeFromIndex(id: string): Promise<void> {
		await this.storageEngine.removeFromList(this.namespace, [id]);
	}

	/**
	 * Check if a guild is indexed alias cached
	 * @param id - id of the guild
	 * @returns True if this guild is cached and false if not
	 */
	public async isIndexed(id: string): Promise<boolean> {
		return this.storageEngine.isListMember(this.namespace, id);
	}

	/**
	 * Get all guild ids currently indexed
	 * @returns array of guild ids
	 */
	public async getIndexMembers(): Promise<Array<string>> {
		return this.storageEngine.getListMembers(this.namespace);
	}

	/**
	 * Remove the guild index, you should probably not call this at all :<
	 */
	public async removeIndex(): Promise<void> {
		await this.storageEngine.removeList(this.namespace);
	}

	/**
	 * Get the number of guilds that are currently cached
	 * @returns Number of guilds currently cached
	 */
	public async getIndexCount(): Promise<number> {
		return this.storageEngine.getListCount(this.namespace);
	}
}

export default GuildCache;
