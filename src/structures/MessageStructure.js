const BaseStructure = require('./BaseStructure');

/**
 * Structure used for holding the values of a message object
 */
class MessageStructure extends BaseStructure {
    /**
     * Create a new MessageStructure, which gives you access to all properties of the passed [Message](?api=RainCache#Message)
     * @param {String} id - id of the user
     * @param {Message} data - a [Message](?api=RainCache#Message) object
     * @param {MessageCache} cache - a [MessageCache](?api=RainCache#MessageCache), allows you to access the cache this object originated from
     * @extends {Message}
     * @extends {BaseStructure}
     */
    constructor(id, data, cache) {
        super(id, data, cache);
    }
}

/**
 * @typedef {Object} Message - Represents a [message](https://discordapp.com/developers/docs/resources/channel#message-object) sent in a channel within Discord.
 * @property {String} id - id of the message
 * @property {String} channel_id - id of the channel the message was sent in
 * @property {User|WebhookUser} author - author of the message, may either be a user or a webhook user (webhook_id is not null)
 * @property {String} content - the content of the message
 * @property {String} timestamp - timestamp when the message was sent
 * @property {String} edited_timestamp - timestamp of the last edit of the message (if any)
 * @property {Boolean} tts - whether this message used TTS (text to speech)
 * @property {Boolean} mention_everyone - whether this message mentions everyone
 * @property {User[]} mentions - users which were mentioned in this message
 * @property {Role[]} mention_roles - roles which were mentioned in this message
 * @property {Object[]} attachments - an array of [attachment](https://discordapp.com/developers/docs/resources/channel#attachment-object) objects
 * @property {Object[]} embeds - an array of [embed](https://discordapp.com/developers/docs/resources/channel#embed-object) objects
 * @property {Object[]} reactions - an array of [reaction](https://discordapp.com/developers/docs/resources/channel#reaction-object) objects
 * @property {String} nonce - nonce used for validating if the message was sent
 * @property {Boolean} pinned - if this message is pinned to the channel
 * @property {String} webhook_id - id of the webhook that sent the message if any
 * @property {Number} type - [type](https://discordapp.com/developers/docs/resources/channel#message-object-message-types) of the message
 * @property {Object} activity - [message activity](https://discordapp.com/developers/docs/resources/channel#message-object-message-activity-structure) object
 * @property {Object} application - [message application](https://discordapp.com/developers/docs/resources/channel#message-object-message-application-structure) object
 */

/**
 * @typedef {Object} WebhookUser - user object shown for messages sent by a webhook
 * @property {String} id - id of the webhook
 * @property {String} username - username of the webhook
 * @property {String} avatar - avatar of the webhook
 */



module.exports = MessageStructure;
