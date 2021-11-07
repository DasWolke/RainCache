"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
/**
 * Cache responsible for guilds
 */
class GuildCache extends BaseCache_1.default {
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
    constructor(storageEngine, channelCache, roleCache, memberCache, emojiCache, presenceCache, guildToChannelCache, rain, boundObject) {
        super(rain);
        this.storageEngine = storageEngine;
        this.namespace = "guild";
        this.channelCache = channelCache;
        this.roleCache = roleCache;
        this.memberCache = memberCache;
        this.emojiCache = emojiCache;
        this.presenceCache = presenceCache;
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
    async get(id) {
        var _a;
        if (this.boundObject) {
            return this;
        }
        const guild = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id)));
        if (guild) {
            return new GuildCache(this.storageEngine, this.channelCache.bindGuild(guild.id), this.roleCache.bindGuild(guild.id), this.memberCache.bindGuild(guild.id), this.emojiCache.bindGuild(guild.id), this.presenceCache.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id), this.rain, guild);
        }
        else {
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
    async update(id, data) {
        var _a, _b;
        if (this.boundObject) {
            this.bindObject(data); //using bindobject() to assure the data of the class is valid
        }
        if (data.channels && data.channels.length > 0) {
            await this.guildChannelMap.update(id, data.channels.map(c => c.id));
            for (const channel of data.channels) {
                channel.guild_id = id;
                await this.channelCache.update(channel.id, channel);
                // console.log(`Cached channel ${channel.id}|#"${channel.name}"|${typeof channel.name}`);
            }
        }
        if (data.members && data.members.length > 0) {
            const membersPromiseBatch = [];
            for (const member of data.members) {
                member.guild_id = id;
                membersPromiseBatch.push(this.memberCache.update(member.user.id, id, member));
            }
            await Promise.all(membersPromiseBatch);
            // console.log(`Cached ${data.members.length} Guild Members from guild ${id}|${data.name}`);
        }
        if (data.presences && data.presences.length > 0) {
            const presencePromiseBatch = [];
            for (const presence of data.presences) {
                presencePromiseBatch.push(this.presenceCache.update(presence.user.id, presence));
            }
            await Promise.all(presencePromiseBatch);
            // console.log(`Cached ${data.presences.length} presences from guild ${id}|${data.name}`);
        }
        if (data.roles && data.roles.length > 0) {
            const rolePromiseBatch = [];
            for (const role of data.roles) {
                rolePromiseBatch.push(this.roleCache.update(role.id, id, role));
            }
            await Promise.all(rolePromiseBatch);
            // console.log(`Cached ${data.roles.length} roles from guild ${id}|${data.name}`);
        }
        if (data.emojis && data.emojis.length > 0) {
            const emojiPromiseBatch = [];
            for (const emoji of data.emojis) {
                emojiPromiseBatch.push(this.emojiCache.update(emoji.id, id, emoji));
            }
            await Promise.all(emojiPromiseBatch);
        }
        if (data.voice_states && data.voice_states.length > 0) {
            const voicePromiseBatch = [];
            for (const state of data.voice_states) {
                if (!state.guild_id)
                    state.guild_id = id;
                voicePromiseBatch.push(this.rain.cache.voiceState.update(state.user_id, id, state));
            }
            await Promise.all(voicePromiseBatch);
        }
        delete data.members;
        delete data.voice_states;
        delete data.roles;
        delete data.presences;
        delete data.emojis;
        delete data.features;
        delete data.channels;
        delete data.voice_states;
        await this.addToIndex(id);
        await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.upsert(this.buildId(id), this.structurize(data)));
        if (this.boundObject)
            return this;
        const guild = await ((_b = this.storageEngine) === null || _b === void 0 ? void 0 : _b.get(this.buildId(id)));
        if (!guild)
            return this;
        return new GuildCache(this.storageEngine, this.channelCache.bindGuild(guild.id), this.roleCache.bindGuild(guild.id), this.memberCache.bindGuild(guild.id), this.emojiCache.bindGuild(guild.id), this.presenceCache.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id), this.rain, guild);
    }
    /**
     * Removes a guild and associated elements from the cache.
     * @param id id of the guild to remove
     */
    async remove(id) {
        var _a, _b, _c;
        const guild = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id)));
        if (guild) {
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
            for (const channel of ((_b = channelMap === null || channelMap === void 0 ? void 0 : channelMap.boundObject) === null || _b === void 0 ? void 0 : _b.channels) || []) {
                await this.channelCache.remove(channel);
            }
            for (const member of members) {
                await this.memberCache.remove(member, id);
            }
            await this.guildChannelMap.remove(id);
            await this.removeFromIndex(id);
            return (_c = this.storageEngine) === null || _c === void 0 ? void 0 : _c.remove(this.buildId(id));
        }
        else {
            return undefined;
        }
    }
    /**
     * Filter through the collection of guilds
     * @param fn Filter function
     * @returns array of bound guild caches
     */
    async filter(fn) {
        var _a;
        const guilds = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.filter(fn, undefined, this.namespace));
        if (!guilds)
            return [];
        return guilds.map(g => new GuildCache(this.storageEngine, this.channelCache, this.roleCache.bindGuild(g.id), this.memberCache.bindGuild(g.id), this.emojiCache.bindGuild(g.id), this.presenceCache.bindGuild(g.id), this.guildChannelMap.bindGuild(g.id), this.rain, g));
    }
    /**
     * Filter through the collection of guilds and return the first match
     * @param fn Filter function
     * @returns returns a bound guild cache
     */
    async find(fn) {
        var _a;
        const guild = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.find(fn, undefined, this.namespace));
        if (!guild)
            return null;
        return new GuildCache(this.storageEngine, this.channelCache.bindGuild(guild.id), this.roleCache.bindGuild(guild.id), this.memberCache.bindGuild(guild.id), this.emojiCache.bindGuild(guild.id), this.presenceCache.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id), this.rain, guild);
    }
    /**
     * Add a guild to the guild index
     * @param id ids of the guilds
     */
    async addToIndex(id) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.addToList(this.namespace, id);
    }
    /**
     * Remove a guild from the guild index
     * @param id id of the guild
     */
    async removeFromIndex(id) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.removeFromList(this.namespace, id);
    }
    /**
     * Check if a guild is indexed alias cached
     * @param id - id of the guild
     * @returns True if this guild is cached and false if not
     */
    async isIndexed(id) {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.isListMember(this.namespace, id)) || false;
    }
    /**
     * Get all guild ids currently indexed
     * @returns array of guild ids
     */
    async getIndexMembers() {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.getListMembers(this.namespace)) || [];
    }
    /**
     * Remove the guild index, you should probably not call this at all :<
     */
    async removeIndex() {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.removeList(this.namespace);
    }
    /**
     * Get the number of guilds that are currently cached
     * @returns Number of guilds currently cached
     */
    async getIndexCount() {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.getListCount(this.namespace)) || 0;
    }
}
module.exports = GuildCache;
