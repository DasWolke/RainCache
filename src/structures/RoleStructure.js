const BaseStructure = require('./BaseStructure');

/**
 * Structure used for holding the values of a role object
 */
class RoleStructure extends BaseStructure {
    /**
     * Create a new RoleStructure, which gives you access to all properties of the passed [Role](?api=RainCache#Role)
     * @param {String} id - id of the role
     * @param {Role} data - a [Role](?api=RainCache#Role) object
     * @param {RoleCache} cache - a [RoleCache](?api=RainCache#RoleCache), allows you to access the cache this object originated from
     * @extends {Role}
     * @extends {BaseStructure}
     */
    constructor(id, data, cache) {
        super(id, data, cache);
    }
}

/**
 * @typedef {Object} Role - a [Discord role](https://discordapp.com/developers/docs/topics/permissions#role-object) object
 * @property {String} id - role id
 * @property {String} name - role name
 * @property {Number} color - integer representation of hexadecimal color code
 * @property {Boolean} hoist - if this role is hoisted
 * @property {Number} position - position of the role, Roles with a lower position can't execute actions on roles with a higher position
 * @property {Number} permissions - permission bit set
 * @property {Boolean} managed - if this role is managed by an integration (also true for bot roles that are added when you add a bot that requires permissions)
 * @property {Boolean} mentionable - if this role can be mentioned
 * @property {String} ?guild_id - optional guild id, of the guild that owns this role, not supplied by Discord.
 */

module.exports = RoleStructure;
