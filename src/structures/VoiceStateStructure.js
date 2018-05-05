const BaseStructure = require('./BaseStructure');

/**
 * Structure used for holding the values of a voice state object
 */
class VoiceStateStructure extends BaseStructure {
    /**
     * Create a new VoiceStateStructure, which gives you access to all properties of the passed [VoiceState](?api=RainCache#VoiceState)
     * @param {String} id - id of the user
     * @param {VoiceState} data - a [VoiceState](?api=RainCache#VoiceState) object
     * @param {VoiceStateCache} cache - a [VoiceStateCache](?api=RainCache#VoiceStateCache), allows you to access the cache this object originated from
     * @extends {VoiceState}
     * @extends {BaseStructure}
     */
    constructor(id, data, cache) {
        super(id, data, cache);
    }
}

/**
 * @typedef {Object} VoiceState - the current [voice state](https://discordapp.com/developers/docs/resources/voice#voice-state-object) of a member, if they are connected to a voicechannel and if yes which channel
 * @property {String} guild_id - the guild id this voice state is for
 * @property {String} channel_id - the channel id this user is connected to
 * @property {String} user_id - the user id this voice state is for
 * @property {String} session_id - the session id for this voice state
 * @property {Boolean} deaf - whether this user is deafened by the server
 * @property {Boolean} mute - whether this user is muted by the server
 * @property {Boolean} self_deaf - whether this user is locally deafened
 * @property {Boolean} self_mute - whether this user is locally muted
 * @property {Boolean} suppress - whether this user is muted by the current user
 */



module.exports = VoiceStateStructure;
