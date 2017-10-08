'use strict';
const BaseCache = require('./BaseCache');

/**
 * Cache responsible for guilds
 */
class GuildCache extends BaseCache {
    /**
     * Create a new Guildcache
     * @param storageEngine - Storage engine to use for this cache
     * @param channelCache - Instantiated ChannelCache class
     * @param roleCache - Instantiated RoleCache class
     * @param memberCache - Instantiated MemberCache class
     * @param emojiCache - Instantiated EmojiCache class
     * @param presenceCache - Instantiated PresenceCache class
     * @param guildToChannelCache - Instantiated ChannelMap class
     * @param boundObject - Optional, may be used to bind a guild object to the cache
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
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    /**
     * Retrieves a guild via id
     * @param id - Discord id of the guild
     * @returns {Promise.<GuildCache|null>} Returns either a Guild Object or null if the guild does not exist.
     */
    async get(id) {
        if (this.boundObject) {
            return this.boundObject;
        }
        let guild = await this.storageEngine.get(this.buildId(id));
        if (guild) {
            return new GuildCache(this.storageEngine, this.channels.bindGuild(guild.id), this.roles.bindGuild(guild.id), this.members.bindGuild(guild.id), this.emojis.bindGuild(guild.id), this.presences.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id), guild);
        } else {
            return null;
        }
    }

    /**
     * Upsert a guild object
     * @param {String} id - id of the guild
     * @param {Object} data - data received from the event
     * @param {Array|} data.channels - Array of channels
     * @param {Array|} data.members - Array of members
     * @param {Array|} data.presences - Array of presences
     * @param {Array|} data.roles - Array of roles
     * @returns {Promise.<GuildCache>}
     */
    async update(id, data) {
        if (this.boundObject) {
            this.bindObject(data); //using bindobject() to assure the data of the class is valid
            await this.update(this.boundObject.id, data);
            return this;
        }
        if (data.channels) {
            await this.guildChannelMap.update(id, data.channels.map(c => c.id));
            for (let channel of data.channels) {
                channel.guild_id = id;
                await this.channels.update(channel.id, channel);
                // console.log(`Cached channel ${channel.id}|#"${channel.name}"|${typeof channel.name}`);
            }
        }
        if (data.members) {
            let membersPromiseBatch = [];
            for (let member of data.members) {
                member.guild_id = id;
                membersPromiseBatch.push(this.members.update(member.user.id, id, member));
            }
            await Promise.all(membersPromiseBatch);
            console.log(`Cached ${data.members.length} Guild Members from guild ${id}|${data.name}`);
        }
        if (data.presences) {
            let presencePromiseBatch = [];
            for (let presence of data.presences) {
                presencePromiseBatch.push(this.presences.update(presence.user.id, presence));
            }
            await Promise.all(presencePromiseBatch);
            console.log(`Cached ${data.presences.length} presences from guild ${id}|${data.name}`);
        }
        if (data.roles) {
            let rolePromiseBatch = [];
            for (let role of data.roles) {
                rolePromiseBatch.push(this.roles.update(role.id, id, role));
            }
            await Promise.all(rolePromiseBatch);
            console.log(`Cached ${data.roles.length} roles from guild ${id}|${data.name}`);
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
        let guild = await this.storageEngine.get(this.buildId(id));
        return new GuildCache(this.storageEngine, this.channels.bindGuild(guild.id), this.roles.bindGuild(guild.id), this.members.bindGuild(guild.id), this.emojis.bindGuild(guild.id), this.presences.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id), guild);
    }

    /**
     * Removes a guild from the cache.
     * @param {String} id - id of the guild to remove
     * @returns {Promise.<null>}
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
            for (let emoji of emojis) {
                await this.emojis.remove(id, emoji);
            }
            for (let role of roles) {
                await this.roles.remove(id, role);
            }
            for (let channel of channelMap.channels) {
                await this.channels.remove(channel);
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
     * @param fn - Filter function
     * @returns {Promise.<Array>}
     */
    async filter(fn) {
        let guilds = await this.storageEngine.filter(fn, this.namespace);
        return guilds.map(g => new GuildCache(this.storageEngine, this.channels, this.roles.bindGuild(g.id), this.members.bindGuild(g.id), this.emojis.bindGuild(g.id), this.presences.bindGuild(g.id), this.guildChannelMap.bindGuild(g.id), g));
    }

    /**
     * Filter through the collection of guilds and return the first match
     * @param fn - Filter function
     * @returns {Promise.<GuildCache>}
     */
    async find(fn) {
        let guild = await this.storageEngine.find(fn, this.namespace);
        return new GuildCache(this.storageEngine, this.channels.bindGuild(guild.id), this.roles.bindGuild(guild.id), this.members.bindGuild(guild.id), this.emojis.bindGuild(guild.id), this.presences.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id), guild);
    }

    async addToIndex(id) {
        return this.storageEngine.addToList(this.namespace, id);
    }

    async removeFromIndex(id) {
        return this.storageEngine.removeFromList(this.namespace, id);
    }

    async isIndexed(id) {
        return this.storageEngine.isListMember(this.namespace, id);
    }

    async getIndexMembers() {
        return this.storageEngine.getListMembers(this.namespace);
    }

    async removeIndex() {
        return this.storageEngine.removeList(this.namespace);
    }
}

module.exports = GuildCache;
