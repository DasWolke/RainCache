const BaseStructure = require('./BaseStructure');

/**
 * Structure used for holding the values of a user object
 */
class UserStructure extends BaseStructure {
    /**
     * Create a new UserStructure, which gives you access to all properties of the passed [User](?api=RainCache#User)
     * @param {String} id - id of the user
     * @param {User} data - a [User](?api=RainCache#User) object
     * @param {UserCache} cache - a [UserCache](?api=RainCache#UserCache), allows you to access the cache this object originated from
     * @extends {User}
     * @extends {BaseStructure}
     */
    constructor(id, data, cache) {
        super(id, data, cache);
    }
}

/**
 * @typedef {Object} User - a [Discord user](https://discordapp.com/developers/docs/resources/user#user-object-user-structure) object
 * @property {String} id - id of the user
 * @property {String} username - username of the user
 * @property {String} discriminator - 4 digit long Discord tag
 * @property {String} avatar - avatar hash of the user
 * @property {Boolean} bot - Whether the user is a bot
 */

module.exports = UserStructure;
