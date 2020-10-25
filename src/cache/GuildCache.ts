import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";

/**
 * Cache responsible for guilds
 */
class GuildCache extends BaseCache<import("@amanda/discordtypings").GuildData> {
	public channels: import("./ChannelCache");
	public roles: import("./RoleCache");
	public members: import("./MemberCache");
	public emojis: import("./EmojiCache");
	public presences: import("./PresenceCache");
	public guildChannelMap: import("./ChannelMapCache");
	public namespace: "guild";

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
	 * @param boundObject Optional, may be used to bind a guild object to the cache
	 */
	public constructor(storageEngine: BaseStorageEngine<import("@amanda/discordtypings").GuildData>, channelCache: import("./ChannelCache"), roleCache: import("./RoleCache"), memberCache: import("./MemberCache"), emojiCache: import("./EmojiCache"), presenceCache: import("./PresenceCache"), guildToChannelCache: import("./ChannelMapCache"), boundObject?: import("@amanda/discordtypings").GuildData) {
		super();
		this.storageEngine = storageEngine;
		this.namespace = "guild";
		this.channels = channelCache;
		this.roles = roleCache;
		this.members = memberCache;
		this.emojis = emojiCache;
		this.presences = presenceCache;
		this.guildChannelMap = guildToChannelCache;
		if (boundObject) {
			this.bindObject(boundObject);
		}
	}

	/**
	 * Retrieves a guild via id
	 * @param id Discord id of the guild
	 * @returns Returns either a Guild Object or null if the guild does not exist.
	 */
	public async get(id: string): Promise<GuildCache | null> {
		if (this.boundObject) {
			return this;
		}
		const guild = await this.storageEngine?.get(this.buildId(id));
		if (guild) {
			return new GuildCache(this.storageEngine as BaseStorageEngine<import("@amanda/discordtypings").GuildData>, this.channels.bindGuild(guild.id), this.roles.bindGuild(guild.id), this.members.bindGuild(guild.id), this.emojis.bindGuild(guild.id), this.presences.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id), guild);
		} else {
			return null;
		}
	}

	/**
	 * Upsert a guild object
	 * @param id id of the guild
	 * @param data data received from the event
	 * @param data.channels Array of channels
	 * @param data.members Array of members
	 * @param data.presences Array of presences
	 * @param data.roles Array of roles
	 * @param data.emojis Array of emojis
	 * @returns returns a bound guild cache
	 */
	public async update(id: string, data: import ("@amanda/discordtypings").GuildData): Promise<GuildCache> {
		if (this.boundObject) {
			this.bindObject(data); //using bindobject() to assure the data of the class is valid
		}
		if (data.channels && data.channels.length > 0) {
			await this.guildChannelMap.update(id, data.channels.map(c => c.id));
			for (const channel of data.channels) {
				// @ts-ignore
				channel.guild_id = id;
				await this.channels.update(channel.id, channel);
				// console.log(`Cached channel ${channel.id}|#"${channel.name}"|${typeof channel.name}`);
			}
		}
		if (data.members && data.members.length > 0) {
			const membersPromiseBatch = [];
			for (const member of data.members) {
				// @ts-ignore
				member.guild_id = id;
				// @ts-ignore
				membersPromiseBatch.push(this.members.update(member.user.id, id, member));
			}
			await Promise.all(membersPromiseBatch);
			// console.log(`Cached ${data.members.length} Guild Members from guild ${id}|${data.name}`);
		}
		if (data.presences && data.presences.length > 0) {
			const presencePromiseBatch = [];
			for (const presence of data.presences) {
				// @ts-ignore
				presencePromiseBatch.push(this.presences.update(presence.user.id, presence));
			}
			await Promise.all(presencePromiseBatch);
			// console.log(`Cached ${data.presences.length} presences from guild ${id}|${data.name}`);
		}
		if (data.roles && data.roles.length > 0) {
			const rolePromiseBatch = [];
			for (const role of data.roles) {
				// @ts-ignore
				rolePromiseBatch.push(this.roles.update(role.id, id, role));
			}
			await Promise.all(rolePromiseBatch);
			// console.log(`Cached ${data.roles.length} roles from guild ${id}|${data.name}`);
		}
		if (data.emojis && data.emojis.length > 0) {
			const emojiPromiseBatch: Array<Promise<any>> = [];
			for (const emoji of data.emojis) {
				emojiPromiseBatch.push(this.emojis.update(emoji.id, id, emoji));
			}
			await Promise.all(emojiPromiseBatch);
		}
		// @ts-ignore Shut up lmao
		delete data.members;
		// @ts-ignore
		delete data.voice_states;
		// @ts-ignore
		delete data.roles;
		// @ts-ignore
		delete data.presences;
		// @ts-ignore
		delete data.emojis;
		// @ts-ignore
		delete data.features;
		// @ts-ignore
		delete data.channels;
		await this.addToIndex([id]);
		await this.storageEngine?.upsert(this.buildId(id), data);
		if (this.boundObject) return this;
		const guild = await this.storageEngine?.get(this.buildId(id));
		if (!guild) return this;
		return new GuildCache(this.storageEngine as BaseStorageEngine<import("@amanda/discordtypings").GuildData>, this.channels.bindGuild(guild.id), this.roles.bindGuild(guild.id), this.members.bindGuild(guild.id), this.emojis.bindGuild(guild.id), this.presences.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id), guild);
	}

	/**
	 * Removes a guild and associated elements from the cache.
	 * @param id id of the guild to remove
	 */
	public async remove(id: string): Promise<void> {
		const guild = await this.storageEngine?.get(this.buildId(id));
		if (guild) {
			const channelMap = await this.guildChannelMap.get(id);
			const roles = await this.roles.getIndexMembers(id);
			const emojis = await this.emojis.getIndexMembers(id);
			const members = await this.members.getIndexMembers(id);
			for (const emoji of emojis) {
				await this.emojis.remove(emoji, id);
			}
			for (const role of roles) {
				await this.roles.remove(role, id);
			}
			for (const channel of channelMap?.boundObject?.channels || []) {
				await this.channels.remove(channel);
			}
			for (const member of members) {
				await this.members.remove(member, id);
			}
			await this.guildChannelMap.remove(id);
			await this.removeFromIndex(id);
			return this.storageEngine?.remove(this.buildId(id));
		} else {
			return undefined;
		}
	}

	/**
	 * Filter through the collection of guilds
	 * @param fn Filter function
	 * @returns array of bound guild caches
	 */
	public async filter(fn: (emoji?: import("@amanda/discordtypings").GuildData, index?: number, array?: Array<import("@amanda/discordtypings").GuildData>) => unknown): Promise<Array<GuildCache>> {
		const guilds = await this.storageEngine?.filter(fn, undefined, this.namespace);
		if (!guilds) return [];
		return guilds.map(g => new GuildCache(this.storageEngine as BaseStorageEngine<import("@amanda/discordtypings").GuildData>, this.channels, this.roles.bindGuild(g.id), this.members.bindGuild(g.id), this.emojis.bindGuild(g.id), this.presences.bindGuild(g.id), this.guildChannelMap.bindGuild(g.id), g));
	}

	/**
	 * Filter through the collection of guilds and return the first match
	 * @param fn Filter function
	 * @returns returns a bound guild cache
	 */
	public async find(fn: (emoji?: import("@amanda/discordtypings").GuildData, index?: number, array?: Array<string>) => unknown): Promise<GuildCache | null> {
		const guild = await this.storageEngine?.find(fn, undefined, this.namespace);
		if (!guild) return null;
		return new GuildCache(this.storageEngine as BaseStorageEngine<import("@amanda/discordtypings").GuildData>, this.channels.bindGuild(guild.id), this.roles.bindGuild(guild.id), this.members.bindGuild(guild.id), this.emojis.bindGuild(guild.id), this.presences.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id), guild);
	}

	/**
	 * Add a guild to the guild index
	 * @param ids ids of the guilds
	 */
	public async addToIndex(ids: Array<string>): Promise<void> {
		return this.storageEngine?.addToList(this.namespace, ids);
	}

	/**
	 * Remove a guild from the guild index
	 * @param id id of the guild
	 */
	public async removeFromIndex(id: string): Promise<void> {
		return this.storageEngine?.removeFromList(this.namespace, id);
	}

	/**
	 * Check if a guild is indexed alias cached
	 * @param id - id of the guild
	 * @returns True if this guild is cached and false if not
	 */
	public async isIndexed(id: string): Promise<boolean> {
		return this.storageEngine?.isListMember(this.namespace, id) || false;
	}

	/**
	 * Get all guild ids currently indexed
	 * @returns array of guild ids
	 */
	public async getIndexMembers(): Promise<Array<string>> {
		return this.storageEngine?.getListMembers(this.namespace) || [];
	}

	/**
	 * Remove the guild index, you should probably not call this at all :<
	 */
	public async removeIndex(): Promise<void> {
		return this.storageEngine?.removeList(this.namespace);
	}

	/**
	 * Get the number of guilds that are currently cached
	 * @returns Number of guilds currently cached
	 */
	public async getIndexCount(): Promise<number> {
		return this.storageEngine?.getListCount(this.namespace) || 0;
	}
}

export = GuildCache;
