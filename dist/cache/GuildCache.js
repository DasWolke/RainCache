"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseCache_1 = __importDefault(require("./BaseCache"));
class GuildCache extends BaseCache_1.default {
    constructor(storageEngine, channelCache, roleCache, memberCache, emojiCache, presenceCache, guildToChannelCache, rain, boundObject) {
        super(rain);
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
    async get(id) {
        var _a;
        if (this.boundObject) {
            return this;
        }
        const guild = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id)));
        if (guild) {
            return new GuildCache(this.storageEngine, this.channels.bindGuild(guild.id), this.roles.bindGuild(guild.id), this.members.bindGuild(guild.id), this.emojis.bindGuild(guild.id), this.presences.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id), this.rain, guild);
        }
        else {
            return null;
        }
    }
    async update(id, data) {
        var _a, _b;
        if (this.boundObject) {
            this.bindObject(data);
        }
        if (data.channels && data.channels.length > 0) {
            await this.guildChannelMap.update(id, data.channels.map(c => c.id));
            for (const channel of data.channels) {
                channel.guild_id = id;
                await this.channels.update(channel.id, channel);
            }
        }
        if (data.members && data.members.length > 0) {
            const membersPromiseBatch = [];
            for (const member of data.members) {
                member.guild_id = id;
                membersPromiseBatch.push(this.members.update(member.user.id, id, member));
            }
            await Promise.all(membersPromiseBatch);
        }
        if (data.presences && data.presences.length > 0) {
            const presencePromiseBatch = [];
            for (const presence of data.presences) {
                presencePromiseBatch.push(this.presences.update(presence.user.id, presence));
            }
            await Promise.all(presencePromiseBatch);
        }
        if (data.roles && data.roles.length > 0) {
            const rolePromiseBatch = [];
            for (const role of data.roles) {
                rolePromiseBatch.push(this.roles.update(role.id, id, role));
            }
            await Promise.all(rolePromiseBatch);
        }
        if (data.emojis && data.emojis.length > 0) {
            const emojiPromiseBatch = [];
            for (const emoji of data.emojis) {
                emojiPromiseBatch.push(this.emojis.update(emoji.id, id, emoji));
            }
            await Promise.all(emojiPromiseBatch);
        }
        if (data.voice_states && data.voice_states.length > 0) {
            const voicePromiseBatch = [];
            for (const state of data.voice_states) {
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
        return new GuildCache(this.storageEngine, this.channels.bindGuild(guild.id), this.roles.bindGuild(guild.id), this.members.bindGuild(guild.id), this.emojis.bindGuild(guild.id), this.presences.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id), this.rain, guild);
    }
    async remove(id) {
        var _a, _b, _c, _d;
        const guild = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.get(this.buildId(id)));
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
            for (const channel of ((_c = (_b = channelMap) === null || _b === void 0 ? void 0 : _b.boundObject) === null || _c === void 0 ? void 0 : _c.channels) || []) {
                await this.channels.remove(channel);
            }
            for (const member of members) {
                await this.members.remove(member, id);
            }
            await this.guildChannelMap.remove(id);
            await this.removeFromIndex(id);
            return (_d = this.storageEngine) === null || _d === void 0 ? void 0 : _d.remove(this.buildId(id));
        }
        else {
            return undefined;
        }
    }
    async filter(fn) {
        var _a;
        const guilds = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.filter(fn, undefined, this.namespace));
        if (!guilds)
            return [];
        return guilds.map(g => new GuildCache(this.storageEngine, this.channels, this.roles.bindGuild(g.id), this.members.bindGuild(g.id), this.emojis.bindGuild(g.id), this.presences.bindGuild(g.id), this.guildChannelMap.bindGuild(g.id), this.rain, g));
    }
    async find(fn) {
        var _a;
        const guild = await ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.find(fn, undefined, this.namespace));
        if (!guild)
            return null;
        return new GuildCache(this.storageEngine, this.channels.bindGuild(guild.id), this.roles.bindGuild(guild.id), this.members.bindGuild(guild.id), this.emojis.bindGuild(guild.id), this.presences.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id), this.rain, guild);
    }
    async addToIndex(id) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.addToList(this.namespace, id);
    }
    async removeFromIndex(id) {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.removeFromList(this.namespace, id);
    }
    async isIndexed(id) {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.isListMember(this.namespace, id)) || false;
    }
    async getIndexMembers() {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.getListMembers(this.namespace)) || [];
    }
    async removeIndex() {
        var _a;
        return (_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.removeList(this.namespace);
    }
    async getIndexCount() {
        var _a;
        return ((_a = this.storageEngine) === null || _a === void 0 ? void 0 : _a.getListCount(this.namespace)) || 0;
    }
}
module.exports = GuildCache;
