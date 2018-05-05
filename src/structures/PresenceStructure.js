const BaseStructure = require('./BaseStructure');

/**
 * Structure used for holding the values of a presence object
 */
class PresenceStructure extends BaseStructure {
    /**
     * Create a new PresenceStructure, which gives you access to all properties of the passed [Presence](?api=RainCache#Presence)
     * @param {String} id - id of the user
     * @param {Presence} data - a [Presence](?api=RainCache#Presence) object
     * @param {PresenceCache} cache - a [PresenceCache](?api=RainCache#PresenceCache) instance, allows you to access the cache this object originated from
     * @extends {Presence}
     * @extends {BaseStructure}
     */
    constructor(id, data, cache) {
        super(id, data, cache);
    }
}

/**
 * @typedef {Object} Presence - A [Discord presence](https://discordapp.com/developers/docs/topics/gateway#presence-update-presence-update-event-fields) object
 * @property {User} user - the user which presence is being updated
 * @property {String[]} roles - array of role ids that belong to the user
 * @property {Activity} game - null or the current activity of the user
 * @property {String} guild_id - id of the guild
 * @property {String} status - status of the user, either "idle", "dnd", "online", or "offline"
 */

/**
 * @typedef {Object} Activity - A [Discord activity](https://discordapp.com/developers/docs/topics/gateway#activity-object) object
 * @property {String} name - name of the activity
 * @property {Number} type - type of the activity, checkout [activity types](https://discordapp.com/developers/docs/topics/gateway#activity-object-activity-types) for more info
 * @property {String} ?url - stream url, only present with a type value of 1
 * @property {Object} timestamps - [Activity timestamps](https://discordapp.com/developers/docs/topics/gateway#activity-object-activity-timestamps) relating to the start and the end of an activity
 * @property {String} application_id - application id for the game
 * @property {String} details - details on what the user is doing
 * @property {String} state - current state of the users party
 * @property {Object} party - A [Discord party](https://discordapp.com/developers/docs/topics/gateway#activity-object-activity-party) object containing information about the current party of the player
 * @property {Object} assets - [Assets](https://discordapp.com/developers/docs/topics/gateway#activity-object-activity-assets) (Images/Texts) accompanying an activity
 * @property {Object} secrets - [Secrets](https://discordapp.com/developers/docs/topics/gateway#activity-object-activity-secrets) accompanying an activity
 * @property {Boolean} instance - whether or not the activity is an instanced game session
 * @property {Number} flags - [activity flags](https://discordapp.com/developers/docs/topics/gateway#activity-object-activity-flags) `ORd` together, describes what the payload includes
 */


module.exports = PresenceStructure;
