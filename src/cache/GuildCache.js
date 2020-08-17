const BaseCache = require("./BaseCache");

/**
 * Cache responsible for guilds
 */
class GuildCache extends BaseCache {
	/**
	 * Create a new GuildCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param {import("../storageEngine/BaseStorageEngine")} storageEngine - Storage engine to use for this cache
	 * @param {import("./ChannelCache")} channelCache - Instantiated ChannelCache class
	 * @param {import("./RoleCache")} roleCache - Instantiated RoleCache class
	 * @param {import("./MemberCache")} memberCache - Instantiated MemberCache class
	 * @param {import("./EmojiCache")} emojiCache - Instantiated EmojiCache class
	 * @param {import("./PresenceCache")} presenceCache - Instantiated PresenceCache class
	 * @param {import("./ChannelMapCache")} guildToChannelCache - Instantiated ChannelMap class
	 * @param {Guild} boundObject - Optional, may be used to bind a guild object to the cache
	 */
	constructor(storageEngine, channelCache, roleCache, memberCache, emojiCache, presenceCache, guildToChannelCache, boundObject) {
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
	 * @param id - Discord id of the guild
	 * @returns {Promise<GuildCache|null>} Returns either a Guild Object or null if the guild does not exist.
	 */
	async get(id) {
		if (this.boundObject) {
			return this.boundObject;
		}
		const guild = await this.storageEngine.get(this.buildId(id));
		if (guild) {
			return new GuildCache(this.storageEngine, this.channels.bindGuild(guild.id), this.roles.bindGuild(guild.id), this.members.bindGuild(guild.id), this.emojis.bindGuild(guild.id), this.presences.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id), guild);
		} else {
			return null;
		}
	}

	/**
	 * Upsert a guild object
	 * @param {string} id - id of the guild
	 * @param {Object} data - data received from the event
	 * @param {?Array<import("@amanda/discordtypings").GuildChannelData>} data.channels - Array of channels
	 * @param {?Array} data.members - Array of members
	 * @param {?Array} data.presences - Array of presences
	 * @param {?Array<import("./RoleCache").Role>} data.roles - Array of roles
	 * @param {?Array<import("./EmojiCache").Emoji>} data.emojis - Array of emojis
	 * @returns {Promise<GuildCache>} - returns a bound guild cache
	 */
	async update(id, data) {
		if (this.boundObject) {
			this.bindObject(data); //using bindobject() to assure the data of the class is valid
			await this.update(this.boundObject.id, data);
			return this;
		}
		if (data.channels && data.channels.length > 0) {
			await this.guildChannelMap.update(id, data.channels.map(c => c.id));
			for (const channel of data.channels) {
				channel.guild_id = id;
				await this.channels.update(channel.id, channel);
				// console.log(`Cached channel ${channel.id}|#"${channel.name}"|${typeof channel.name}`);
			}
		}
		if (data.members && data.members.length > 0) {
			const membersPromiseBatch = [];
			for (const member of data.members) {
				member.guild_id = id;
				membersPromiseBatch.push(this.members.update(member.user.id, id, member));
			}
			await Promise.all(membersPromiseBatch);
			// console.log(`Cached ${data.members.length} Guild Members from guild ${id}|${data.name}`);
		}
		if (data.presences && data.presences.length > 0) {
			const presencePromiseBatch = [];
			for (const presence of data.presences) {
				presencePromiseBatch.push(this.presences.update(presence.user.id, presence));
			}
			await Promise.all(presencePromiseBatch);
			// console.log(`Cached ${data.presences.length} presences from guild ${id}|${data.name}`);
		}
		if (data.roles && data.roles.length > 0) {
			const rolePromiseBatch = [];
			for (const role of data.roles) {
				rolePromiseBatch.push(this.roles.update(role.id, id, role));
			}
			await Promise.all(rolePromiseBatch);
			// console.log(`Cached ${data.roles.length} roles from guild ${id}|${data.name}`);
		}
		if (data.emojis && data.emojis.length > 0) {
			const emojiPromiseBatch = [];
			for (const emoji of data.emojis) {
				emojiPromiseBatch.push(this.emojis.update(emoji.id, id, emoji));
			}
			await Promise.all(emojiPromiseBatch);
		}
		delete data.members;
		delete data.voice_states;
		delete data.roles;
		delete data.presences;
		delete data.emojis;
		delete data.features;
		delete data.channels;
		await this.addToIndex(id);
		await this.storageEngine.upsert(this.buildId(id), data);
		const guild = await this.storageEngine.get(this.buildId(id));
		return new GuildCache(this.storageEngine, this.channels.bindGuild(guild.id), this.roles.bindGuild(guild.id), this.members.bindGuild(guild.id), this.emojis.bindGuild(guild.id), this.presences.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id), guild);
	}

	/**
	 * Removes a guild and associated elements from the cache.
	 * @param {string} id - id of the guild to remove
	 * @returns {Promise<void>}
	 */
	async remove(id) {
		if (this.boundObject) {
			return this.remove(this.boundObject.id);
		}
		const guild = await this.storageEngine.get(this.buildId(id));
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
			for (const channel of channelMap.channels) {
				await this.channels.remove(channel);
			}
			for (const member of members) {
				await this.members.remove(member, id);
			}
			await this.guildChannelMap.remove(id);
			await this.removeFromIndex(id);
			return this.storageEngine.remove(this.buildId(id));
		} else {
			return null;
		}
	}

	/**
	 * Filter through the collection of guilds
	 * @param {Function} fn - Filter function
	 * @returns {Promise<Array<GuildCache>>} - array of bound guild caches
	 */
	async filter(fn) {
		const guilds = await this.storageEngine.filter(fn, this.namespace);
		return guilds.map(g => new GuildCache(this.storageEngine, this.channels, this.roles.bindGuild(g.id), this.members.bindGuild(g.id), this.emojis.bindGuild(g.id), this.presences.bindGuild(g.id), this.guildChannelMap.bindGuild(g.id), g));
	}

	/**
	 * Filter through the collection of guilds and return the first match
	 * @param {Function} fn - Filter function
	 * @returns {Promise<GuildCache>} - returns a bound guild cache
	 */
	async find(fn) {
		const guild = await this.storageEngine.find(fn, this.namespace);
		return new GuildCache(this.storageEngine, this.channels.bindGuild(guild.id), this.roles.bindGuild(guild.id), this.members.bindGuild(guild.id), this.emojis.bindGuild(guild.id), this.presences.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id), guild);
	}

	/**
	 * Add a guild to the guild index
	 * @param {string} id - id of the guild
	 * @returns {Promise<void>}
	 */
	async addToIndex(id) {
		return this.storageEngine.addToList(this.namespace, id);
	}

	/**
	 * Remove a guild from the guild index
	 * @param {string} id - id of the guild
	 * @returns {Promise<void>}
	 */
	async removeFromIndex(id) {
		return this.storageEngine.removeFromList(this.namespace, id);
	}

	/**
	 * Check if a guild is indexed alias cached
	 * @param {string} id - id of the guild
	 * @returns {Promise<boolean>} - True if this guild is cached and false if not
	 */
	async isIndexed(id) {
		return this.storageEngine.isListMember(this.namespace, id);
	}

	/**
	 * Get all guild ids currently indexed
	 * @returns {Promise<Array<string>>} - array of guild ids
	 */
	async getIndexMembers() {
		return this.storageEngine.getListMembers(this.namespace);
	}

	/**
	 * Remove the guild index, you should probably not call this at all :<
	 * @returns {Promise<void>}
	 */
	async removeIndex() {
		return this.storageEngine.removeList(this.namespace);
	}

	/**
	 * Get the number of guilds that are currently cached
	 * @return {Promise<number>} - Number of guilds currently cached
	 */
	async getIndexCount() {
		return this.storageEngine.getListCount(this.namespace);
	}
}

/**
 * @typedef {Object} Guild - Object describing a regular discord guild
 * @property {string} id - guild id
 * @property {string} name - guild name
 * @property {string} icon - icon hash
 * @property {string} splash - splash image hash
 * @property {string} owner_id - id of the owner
 * @property {string} region - id of the voice region
 * @property {string} afk_channel_id - id of the afk channel
 * @property {number} afk_timeout - afk timeout in seconds
 * @property {boolean} embed_enabled - if the guild is embeddable
 * @property {string} embed_channel_id - id of embedded channel
 * @property {number} verification level - [verification level](https://discordapp.com/developers/docs/resources/guild#guild-object-verification-level) of the guild
 * @property {number} default_message_notifications - default
 * [notification level](https://discordapp.com/developers/docs/resources/guild#guild-object-default-message-notification-level) of the guild
 * @property {number} explicit_content_filter - default [filter level](https://discordapp.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level)
 * @property {Array<import("./RoleCache").Role>} roles - Array of roles
 * @property {Array<import("./EmojiCache").Emoji>} emojis - Array of emojis
 * @property {Array<string>} features - Array of enabled guild features
 * @property {number} mfa_level - required [mfa level](https://discordapp.com/developers/docs/resources/guild#guild-object-mfa-level) for the guild
 * @property {string} [application_id] - application id of the guild creator, if the guild was created by a bot
 * @property {boolean} widget_enabled - if the server widget is enabled
 * @property {string} widget_channel_id - channel id of the server widget
 */

module.exports = GuildCache;
