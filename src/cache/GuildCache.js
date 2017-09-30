'use strict';
const BaseCache = require('./BaseCache');

class GuildCache extends BaseCache {
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
        await this.storageEngine.upsert(this.buildId(id), data);
        let guild = await this.storageEngine.get(this.buildId(id));
        return new GuildCache(this.storageEngine, this.channels.bindGuild(guild.id), this.roles.bindGuild(guild.id), this.members.bindGuild(guild.id), this.emojis.bindGuild(guild.id), this.presences.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id), guild);
    }

    async remove(id) {
        if (this.boundObject) {
            return this.remove(this.boundObject.id);
        }
        let guild = await this.storageEngine.get(this.buildId(id));
        if (guild) {
            let channelMap = await this.guildChannelMap.get(id);
            for (let channel of channelMap.channels) {
                await this.channels.remove(channel);
            }
            await this.guildChannelMap.remove(id);
            return this.storageEngine.remove(this.buildId(id));
        } else {
            return null;
        }
    }

    async filter(fn) {
        let guilds = await this.storageEngine.filter(fn, this.namespace);
        return guilds.map(g => new GuildCache(this.storageEngine, this.channels, this.roles.bindGuild(g.id), this.members.bindGuild(g.id), this.emojis.bindGuild(g.id), this.presences.bindGuild(g.id), this.guildChannelMap.bindGuild(g.id), g));
    }

    async find(fn) {
        let guild = await this.storageEngine.find(fn, this.namespace);
        return new GuildCache(this.storageEngine, this.channels.bindGuild(guild.id), this.roles.bindGuild(guild.id), this.members.bindGuild(guild.id), this.emojis.bindGuild(guild.id), this.presences.bindGuild(guild.id), this.guildChannelMap.bindGuild(guild.id), guild);
    }
}

module.exports = GuildCache;
