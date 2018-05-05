const BaseStructure = require('./BaseStructure');

/**
 * Structure used for holding the values of a permission overwrite object
 */
class PermissionOverwriteStructure extends BaseStructure {
    /**
     * Create a new PermissionOverwriteStructure, which gives you access to all properties of the passed [PermissionOverwrite](?api=RainCache#PermissionOverwrite)
     * @param {String} id - id of the permission overwrite
     * @param {PermissionOverwrite} data - a [PermissionOverwrite](?api=RainCache#PermissionOverwrite)
     * @param {PermissionOverwriteCache} cache - a [PermissionOverwriteCache](?api=RainCache#PermissionOverwriteCache) instance, allows you to access the cache this object originated from
     * @extends {PermissionOverwrite}
     * @extends {BaseStructure}
     */
    constructor(id, data, cache) {
        super(id, data, cache);
    }
}

/**
 * @typedef {Object} PermissionOverwrite - [permission overwrite](https://discordapp.com/developers/docs/resources/channel#overwrite-object) object, which is used to overwrite permissions on a channel level
 * @property {Number} allow - bitwise value of allowed permissions
 * @property {Number} deny - bitwise value of disallowed permissions
 * @property {String} type - type of the overwrite, either member or role
 */

module.exports = PermissionOverwriteStructure;
