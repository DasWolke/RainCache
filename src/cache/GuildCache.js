'use strict';
const BaseCache = require('./BaseCache');

class GuildCache extends BaseCache {
    constructor(storageEngine, channelCache, roleCache, memberCache, emojiCache, guildToChannelCache, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = 'guild';
        this.channels = channelCache;
        this.roles = roleCache;
        this.members = memberCache;
        this.emojis = emojiCache;
        this.guildChannelMap = guildToChannelCache;
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    async get (id) {
        if (this.boundObject) {
            return this.boundObject;
        }
        let guild = await this.storageEngine.get(this.buildId(id));
        if (guild) {
            return new GuildCache(this.storageEngine, this.channels, this.roles, this.members, this.emojis, guild);
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
                await this.channels.update(channel.id, channel);
                console.log(`Cached channel ${channel.id}|#"${channel.name}"|${typeof channel.name}`);
            }
        }
        if (data.members) {
            let membersPromiseBatch = [];
            for (let member of data.members) {
                membersPromiseBatch.push(this.members.update(member.user.id, id, member));
            }
            await Promise.all(membersPromiseBatch);
            console.log(`Cached ${data.members.length} Guild Members from guild ${id}|${data.name}`);
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
        return new GuildCache(this.storageEngine, this.channels, this.roles, this.members, this.emojis, guild);
    }

    async remove(id) {
        if (this.boundObject) {
            return this.remove(this.boundObject.id);
        }
        let guild = await this.storageEngine.get(this.buildId(id));
        if (guild) {
            let channelMap = await this.guildChannelMap.get(id);
            for (let channel of channelMap.data) {
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
        return guilds.map(g => new GuildCache(this.storageEngine, this.channels, this.roles, this.members, this.presences, this.emojis, g));
    }

    async find(fn) {
        let guild = await this.storageEngine.find(fn, this.namespace);
        return new GuildCache(this.storageEngine, this.channels, this.roles, this.members, this.presences, this.emojis, guild);
    }
}

module.exports = GuildCache;
