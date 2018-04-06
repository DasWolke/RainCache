const BaseStructure = require('./BaseStructure');

/**
 * Structure used for holding the values of a channel object
 */
class ChannelStructure extends BaseStructure {
    /**
     * Create a new Channel Structure, this structure gives you access to all properties of the channel object passed
     * @param {String} id - id of the channel
     * @param {Channel} data - a [discord channel object](?api=Structures#Channel)
     * @param {BaseCache} cache - a [ChannelCache](?api=RainCache#ChannelCache) instance, allows you to access the cache this object originated from
     * @extends {Channel}
     * @extends {BaseStructure}
     */
    constructor(id, data, cache) {
        super();
        this.id = id;
        this.cache = cache;
        data = data || {};
        Object.assign(this, data);
    }
}

module.exports = ChannelStructure;

// To anyone wanting to write a library: JUST COPY THIS SHIT, filling this out manually wasn't fun :<
// https://www.youtube.com/watch?v=oXUMPSjwpFI have a weird video to distract yourself from the problems that will come upon ya
/**
 * @typedef {Object} Channel - a discord channel object
 * @property {String} id - id of the channel
 * @property {Number} type - [type](https://discordapp.com/developers/docs/resources/channel#channel-object-channel-types) of channel
 * @property {String} [guild_id] - id of the Guild of the channel
 * @property {Number} [position] - sorting position of the channel (Channels are sorted in an ascending way, e.g. 0 is the highest channel, while 9 is the lowest)
 * @property {PermissionOverwrite[]} [permission_overwrites] - array of [permission overwrites](?api=Structures#PermissionOverwrite) for this channel
 * @property {String} [name] - name of the channel
 * @property {String} [topic] - topic of the channel
 * @property {Boolean} [nsfw] - if the channel is nsfw (guild only)
 * @property {String} [last_message_id] - the id of the last message sent in this channel
 * @property {Number} [bitrate] - bitrate (in bits) of the channel (voice only)
 * @property {Number} [user_limit] - limit of users in a channel (voice only), if this value is not set it's 0 (unlimited)
 * @property {User[]} [recipients] - recipients of a dm (dm only)
 * @property {String} [icon] - icon hash (dm only)
 * @property {String} [owner_id] - id of the DM creator (dm only)
 * @property {String} [application_id] - application id of the creator of the group dm if a bot created it (group dm only)
 * @property {String} [parent_id] - id of the parent category for a channel
 */

/**
 * @typedef {Object} PermissionOverwrite - permission overwrite object, which is used to overwrite permissions on a channel level
 * @property {Number} allow - bitwise value of allowed permissions
 * @property {Number} deny - bitwise value of disallowed permissions
 * @property {String} type - type of the overwrite, either member or role
 */
