const BaseStructure = require('./BaseStructure');

/**
 * Structure used for holding the values of a self user object
 */
class SelfUserStructure extends BaseStructure {
    /**
     * Create a new SelfUserStructure, which gives you access to all properties of the passed [SelfUser](?api=RainCache#SelfUser)
     * @param {String} id - id of the user
     * @param {SelfUser} data - a [SelfUser](?api=RainCache#SelfUser) object
     * @param {SelfUserCache} cache - a [SelfUserCache](?api=RainCache#SelfUserCache), allows you to access the cache this object originated from
     * @extends {SelfUser}
     * @extends {BaseStructure}
     */
    constructor(id, data, cache) {
        super(id, data, cache);
    }
}

/**
 * @typedef {Object} SelfUser - the currently connected [user](https://discordapp.com/developers/docs/resources/user#user-object-user-structure)
 * @property {String} id - id of the user
 * @property {String} username - username of the user
 * @property {String} discriminator - 4 digit long Discord tag
 * @property {String} avatar - avatar hash of the user
 * @property {Boolean} bot - Whether the user is a bot
 * @property {Boolean} mfa_enabled - whether the user has two factor enabled on their account
 * @property {Boolean} verified - whether the email on this account has been verified
 * @property {String} email - the user's email
 */

module.exports = SelfUserStructure;
