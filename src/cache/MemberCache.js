'use strict';
const BaseCache = require('./BaseCache');

/**
 * Cache responsible for storing guild members
 * @extends BaseCache
 */
class MemberCache extends BaseCache {
    /**
     * Creates a new MemberCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param {Object} storageEngine - storage engine to use
     * @param {UserCache} userCache - user cache instance
     * @param {Object} [boundObject] - Bind an object to this instance
     * @property {String} namespace=member - namespace of this cache, defaults to `member`
     * @property {UserCache} user - user cache instance
     * @property {String} boundGuild - id of a guild this cache is bound to
     */
    constructor(storageEngine, userCache, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = 'member';
        this.user = userCache;
        this.boundGuild = '';
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    /**
     * Get a member via id
     * @param {String} id - id of the member
     * @param {String} [guildId=this.boundGuild] - id of the guild of the member, defaults to the bound guild of the cache
     * @returns {Promise.<MemberCache|null>} - bound member cache with properties of the member or null if no member is cached
     */
    async get(id, guildId = this.boundGuild) {
        if (this.boundObject) {
            return this.boundObject;
        }
        let member = await this.storageEngine.get(this.buildId(id, guildId));
        if (!member) {
            return null;
        }
        return new MemberCache(this.storageEngine, this.user.bindUserId(member.id), member);
    }

    /**
     * Update data of a guild member
     * @param {String} id - id of the member
     * @param {String} [guildId=this.boundGuild] - id of the guild of the member, defaults to the bound guild of the cache
     * @param {GuildMember} data - updated guild member data
     * @returns {Promise.<MemberCache>}
     */
    async update(id, guildId = this.boundGuild, data) {
        if (this.boundObject) {
            this.bindObject(data);
            await this.update(this.boundObject.id, this.boundObject.guild_id, data);
            return this;
        }
        if (!guildId) {
            throw new Error(`Empty guild id for member ${id}`);
        }
        if (!data.guild_id) {
            data.guild_id = guildId;
        }
        if (!data.id) {
            data.id = id;
        }
        if (data.user) {
            await this.user.update(data.user.id, data.user);
            delete data.user;
        }
        await this.addToIndex(id, guildId);
        await this.storageEngine.upsert(this.buildId(id, guildId), data);
        return new MemberCache(this.storageEngine, this.user.bindUserId(data.id), data);
    }

    /**
     * Remove a member from the cache
     * @param {String} id - id of the member
     * @param {String} [guildId=this.boundGuild] - id of the guild of the member, defaults to the bound guild of the cache
     * @return {Promise.<void>}
     */
    async remove(id, guildId = this.boundGuild) {
        if (this.boundObject) {
            return this.remove(this.boundObject.id, this.boundObject.guild_id);
        }
        let member = await this.storageEngine.get(this.buildId(id, guildId));
        if (member) {
            await this.removeFromIndex(id, guildId);
            return this.storageEngine.remove(this.buildId(id, guildId));
        } else {
            return null;
        }
    }

    /**
     * Filter for members by providing filter function which returns true upon success and false otherwise
     * @param fn
     * @param guildId
     * @param ids
     * @return {Promise.<Array|*|{}>}
     */
    async filter(fn, guildId = this.boundGuild, ids = null) {
        let members = await this.storageEngine.filter(fn, ids, super.buildId(guildId));
        return members.map(m => new MemberCache(this.storageEngine, this.user.bindUserId(m.id), m).bindGuild(this.boundGuild));
    }

    /**
     *
     * @param fn
     * @param guildId
     * @param ids
     * @return {Promise.<MemberCache>}
     */
    async find(fn, guildId = this.boundGuild, ids = null) {
        let member = await this.storageEngine.find(fn, ids, super.buildId(guildId));
        return new MemberCache(this.storageEngine, this.user.bindUserId(member.id), member);
    }

    /**
     * Build a unique key for storing member data
     * @param {String} userId - id of the user belonging to the member
     * @param {String} guildId - id of the guild the member+
     * @return {*}
     */
    buildId(userId, guildId) {
        if (!guildId) {
            return super.buildId(userId);
        }
        return `${this.namespace}.${guildId}.${userId}`;
    }

}

/**
 * @typedef {Object} GuildMember
 * @property {User} user - user belonging to the member
 * @property {?String} nick - nickname if the member has one
 * @property {String[]} roles - array of role ids
 * @property {String} joined_at - timestamp when the user joined the guild
 * @property {Boolean} deaf - if the user is deafened
 * @property {Boolean} mute - if the user is muted
 * @property {String} ?id - id of the user belonging to the guild member, only available with raincache
 * @property {String} ?guild_id - id of the guild the user is a member of, only available with raincache
 */

module.exports = MemberCache;
