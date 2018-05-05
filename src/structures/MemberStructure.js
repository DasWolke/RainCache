const BaseStructure = require('./BaseStructure');

/**
 * Structure used for holding the values of a member object
 */
class MemberStructure extends BaseStructure {
    /**
     * Create a new MemberStructure, which gives you access to all properties of the passed [GuildMember](?api=RainCache#GuildMember)
     * @param {String} id - id of the member
     * @param {GuildMember} data - a [GuildMember](?api=RainCache#GuildMember)
     * @param {MemberCache} cache - a [MemberCache](?api=RainCache#MemberCache) instance, allows you to access the cache this object originated from
     * @extends {GuildMember}
     * @extends {BaseStructure}
     */
    constructor(id, data, cache) {
        super(id, data, cache);
    }
}


/**
 * @typedef {Object} GuildMember - a [Discord guild member](https://discordapp.com/developers/docs/resources/guild#guild-member-object) object
 * @property {User} user - user belonging to the member
 * @property {?String} nick - nickname if the member has one
 * @property {String[]} roles - array of role ids
 * @property {String} joined_at - timestamp when the user joined the guild
 * @property {Boolean} deaf - if the user is deafened
 * @property {Boolean} mute - if the user is muted
 * @property {String} ?id - id of the user belonging to the guild member, only available with raincache
 * @property {String} ?guild_id - id of the guild the user is a member of, only available with raincache
 */

module.exports = MemberStructure;
