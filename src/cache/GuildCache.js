'use strict';
const BaseCache = require('./BaseCache');

class GuildCache extends BaseCache {
    constructor(storageEngine, channelCache, roleCache, memberCache, emojiCache, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.storageEngine.updateNamespace('guild.');
        this.channels = channelCache;
        this.roles = roleCache;
        this.members = memberCache;
        this.emojis = emojiCache;
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    async get (id) {
        if (this.boundObject) {
            return this.boundObject;
        }
        let guild = await this.storageEngine.get(id);
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
        delete data.channels;
        delete data.members;
        delete data.voice_states;
        delete data.roles;
        delete data.presences;
        delete data.emojis;
        delete data.features;
        await this.storageEngine.upsert(id, data);
        let guild = await this.storageEngine.get(id);
        return new GuildCache(this.storageEngine, this.channels, this.roles, this.members, this.emojis, guild);
    }

    async remove(id) {
        if (this.boundObject) {
            return this.remove(this.boundObject.id);
        }
        let guild = await this.storageEngine.get(id);
        if (guild) {
            return this.storageEngine.remove(id);
        } else {
            return null;
        }
    }

    async filter(fn) {
        let guilds = await this.storageEngine.filter(fn);
        return guilds.map(g => new GuildCache(this.storageEngine, this.channels, this.roles, this.members, this.presences, this.emojis, g));
    }

    async find(fn) {
        let guild = await this.storageEngine.find(fn);
        return new GuildCache(this.storageEngine, this.channels, this.roles, this.members, this.presences, this.emojis, guild);
    }
}

module.exports = GuildCache;
