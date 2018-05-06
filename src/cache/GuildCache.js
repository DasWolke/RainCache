'use strict';
const BaseCache = require('./BaseCache');

/**
 * Cache responsible for guilds
 * @extends BaseCache
 */
class GuildCache extends BaseCache {
    /**
     * Create a new GuildCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param {StorageEngine} storageEngine - Storage engine to use for this cache
     * @param {ChannelCache} channelCache - Instantiated ChannelCache class
     * @param {RoleCache} roleCache - Instantiated RoleCache class
     * @param {MemberCache} memberCache - Instantiated MemberCache class
     * @param {EmojiCache} emojiCache - Instantiated EmojiCache class
     * @param {PresenceCache} presenceCache - Instantiated PresenceCache class
     * @param {ChannelMapCache} guildToChannelCache - Instantiated ChannelMap class
     * @param {Guild} boundObject - Optional, may be used to bind a guild object to the cache
     * @property {String} namespace=guild - namespace of the cache, defaults to `guild`
     * @property {ChannelCache} channels - Instantiated ChannelCache class
     * @property {RoleCache} roles - Instantiated RoleCache class
     * @property {MemberCache} members - Instantiated MemberCache class
     * @property {EmojiCache} emojis - Instantiated EmojiCache class
     * @property {PresenceCache} presences - Instantiated PresenceCache class
     * @property {ChannelMapCache} guildChannelMap - Instantiated ChannelMap class
     * @extends {BaseCache}
     */
    constructor(storageEngine, channelCache, roleCache, memberCache, emojiCache, presenceCache, guildToChannelCache, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = 'guild';
        this.channels = channelCache;
        this.roles = roleCache;
        this.members = memberCache;
        this.emojis = emojiCache;
        this.presences = presenceCache;
        this.guildChannelMap = guildToChannelCache;
    }

    /**
     * Retrieves a guild via id
     * @param {String} id - id of the guild
     * @returns {Promise.<GuildCache|null>} Returns either a Guild Object or null if the guild does not exist.
     */
    async get(id) {
        if (this.boundObject) {
            return this.boundObject;
        }
        let guild = await this.storageEngine.get(this.buildId(id));
        if (guild) {
            return new GuildCache(this.storageEngine,
                this.channels.bindGuild(guild.id),
                this.roles.bindGuild(guild.id),
                this.members.bindGuild(guild.id),
                this.emojis.bindGuild(guild.id),
                this.presences.bindGuild(guild.id),
                this.guildChannelMap.bindGuild(guild.id),
                guild);
        } else {
            return null;
        }
    }

    /**
     * Retrieve a list of guild ids
     * @param {String[]} ids - array of guild ids
     * @return {Promise.<GuildCache[]>}
     */
    async batchGet(ids) {
        let guilds = await this.storageEngine.batchGet(ids.map(id => this.buildId(id)));
        return guilds.map(guild => new GuildCache(this.storageEngine,
            this.channels.bindGuild(guild.id),
            this.roles.bindGuild(guild.id),
            this.members.bindGuild(guild.id),
            this.emojis.bindGuild(guild.id),
            this.presences.bindGuild(guild.id),
            this.guildChannelMap.bindGuild(guild.id),
            guild));
    }

    /**
     * Upsert a guild object
     * @param {String} id - id of the guild
     * @param {Object} data - data received from the event
     * @param {?Channel[]} data.channels - Array of channels
     * @param {?Array} data.members - Array of members
     * @param {?Array} data.presences - Array of presences
     * @param {?Role[]} data.roles - Array of roles
     * @param {?Emoji[]} data.emojis - Array of emojis
     * @returns {Promise.<GuildCache>} - returns a bound guild cache
     */
    async update(id, data) {
        if (this.boundObject) {
            this.bindObject(data); //using bindobject() to assure the data of the class is valid
            await this.update(this.boundObject.id, data);
            return this;
        }
        let start = Date.now();
        if (data.channels && data.channels.length > 0) {
            data.channels.map(c => {
                c.guild_id = id;
                return c;
            });
            await this.channels.batchUpdate(data.channels.map(c => c.id), data.channels);
        }
        console.log(`Channels ${id} ${Date.now() - start}ms`);
        start = Date.now();
        if (data.members && data.members.length > 0) {
            data.members = data.members.map(m => {
                m.guild_id = id;
                return m;
            });
            await this.members.batchUpdate(data.members.map(m => m.user.id), id, data.members);
            // console.log(`Cached ${data.members.length} Guild Members from guild ${id}|${data.name}`);
        }
        console.log(`Members ${id} ${Date.now() - start}ms`);
        start = Date.now();
        if (data.presences && data.presences.length > 0) {
            await this.presences.batchUpdate(data.presences.map(p => p.user.id), data.presences);
            // console.log(`Cached ${data.presences.length} presences from guild ${id}|${data.name}`);
        }
        console.log(`Presences ${id} ${Date.now() - start}ms`);
        start = Date.now();
        if (data.roles && data.roles.length > 0) {
            await this.roles.batchUpdate(data.roles.map(r => r.id), id, data.roles);
            // console.log(`Cached ${data.roles.length} roles from guild ${id}|${data.name}`);
        }
        console.log(`Roles ${id} ${Date.now() - start}ms`);
        start = Date.now();
        if (data.emojis && data.emojis.length > 0) {
            await this.emojis.batchUpdate(data.emojis.map(e => e.id), id, data.emojis);
        }
        console.log(`Emojis ${id} ${Date.now() - start}ms`);
        start = Date.now();
        delete data.members;
        delete data.voice_states;
        delete data.roles;
        delete data.presences;
        delete data.emojis;
        delete data.features;
        delete data.channels;
        await this.addToIndex(id);
        await this.storageEngine.upsert(this.buildId(id), data);
        let guild = await this.storageEngine.get(this.buildId(id));
        console.log(`Guild ${id} ${Date.now() - start}ms`);
        return new GuildCache(this.storageEngine, this.channels.bindGuild(guild.id), this.roles.bindGuild(guild.id), this.members.bindGuild(guild.id), this.emojis.bindGuild(guild.id), this.presences.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id), guild);
    }

    /**
     * Batch update guilds
     * @param {String[]} ids - Array of guild ids
     * @param {Guild[]} data - Array of guild objects
     *
     *
     * @return {Promise<GuildCache[]>}
     */
    async batchUpdate(ids, data) {
        let promises = [];
        ids.forEach((id, index) => {
            promises.push(this.update(id, data[index]));
        });
        return Promise.all(promises);
    }

    /**
     * Removes a guild and associated elements from the cache.
     * @param {String} id - id of the guild to remove
     * @returns {Promise.<void>}
     */
    async remove(id) {
        if (this.boundObject) {
            return this.remove(this.boundObject.id);
        }
        let guild = await this.storageEngine.get(this.buildId(id));
        if (guild) {
            let channelMap = await this.guildChannelMap.get(id);
            let roles = await this.roles.getIndexMembers(id);
            let emojis = await this.emojis.getIndexMembers(id);
            let members = await this.members.getIndexMembers(id);
            if (emojis && emojis.length > 0) {
                await this.emojis.batchRemove(emojis, id);
            }
            if (roles && roles.length > 0) {
                await this.roles.batchRemove(roles, id);
            }
            if (channelMap.channels && channelMap.channels.length > 0) {
                await this.channels.batchRemove(channelMap.channels);
            }
            if (members && members.length > 0) {
                await this.members.batchRemove(members, id);
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
     * @returns {Promise.<GuildCache[]>} - array of bound guild caches
     */
    async filter(fn) {
        let guilds = await this.storageEngine.filter(fn, this.namespace);
        return guilds.map(g => new GuildCache(this.storageEngine, this.channels, this.roles.bindGuild(g.id), this.members.bindGuild(g.id), this.emojis.bindGuild(g.id), this.presences.bindGuild(g.id), this.guildChannelMap.bindGuild(g.id), g));
    }

    /**
     * Filter through the collection of guilds and return the first match
     * @param {Function} fn - Filter function
     * @returns {Promise.<GuildCache>} - returns a bound guild cache
     */
    async find(fn) {
        let guild = await this.storageEngine.find(fn, this.namespace);
        return new GuildCache(this.storageEngine, this.channels.bindGuild(guild.id), this.roles.bindGuild(guild.id), this.members.bindGuild(guild.id), this.emojis.bindGuild(guild.id), this.presences.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id), guild);
    }

    /**
     * Add a guild to the guild index
     * @param {String} id - id of the guild
     * @returns {Promise.<void>}
     */
    async addToIndex(id) {
        return this.storageEngine.addToList(this.namespace, id);
    }

    /**
     * Remove a guild from the guild index
     * @param {String} id - id of the guild
     * @returns {Promise.<void>}
     */
    async removeFromIndex(id) {
        return this.storageEngine.removeFromList(this.namespace, id);
    }

    /**
     * Check if a guild is indexed alias cached
     * @param {String} id - id of the guild
     * @returns {Promise.<Boolean>} - True if this guild is cached and false if not
     */
    async isIndexed(id) {
        return this.storageEngine.isListMember(this.namespace, id);
    }

    /**
     * Get all guild ids currently indexed
     * @returns {Promise.<String[]>} - array of guild ids
     */
    async getIndexMembers() {
        return this.storageEngine.getListMembers(this.namespace);
    }

    /**
     * Remove the guild index, you should probably not call this at all :<
     * @returns {Promise.<void>}
     */
    async removeIndex() {
        return this.storageEngine.removeList(this.namespace);
    }

    /**
     * Get the number of guilds that are currently cached
     * @return {Promise.<Number>} - Number of guilds currently cached
     */
    async getIndexCount() {
        return this.storageEngine.getListCount(this.namespace);
    }
}

module.exports = GuildCache;
