const BaseStructure = require('./BaseStructure');

/**
 * Structure used for holding the values of an emoji object
 */
class EmojiStructure extends BaseStructure {
    /**
     * Creates a new EmojiStructure, which gives you access to all properties of the passed [Emoji](?api=RainCache#Emoji)
     * @param {String} id - id of the emoji
     * @param {Emoji} data - a [Emoji](?api=RainCache#Emoji)
     * @param {EmojiCache} cache - a [EmojiCache](?api=RainCache#EmojiCache) instance, allows you to access the cache this object originated from
     * @extends {Emoji}
     * @extends {BaseStructure}
     */
    constructor(id, data, cache) {
        super(id, data, cache);
    }
}

/**
 * @typedef {Object} Emoji - A [Discord emoji](https://discordapp.com/developers/docs/resources/emoji#emoji-object) structure
 * @property {String} id - id of the emoji
 * @property {String} name - name of the emoji
 * @property {Array} [roles] - array of roles whitelisted to use the emoji (whitelisted apps only)
 * @property {User} [user] - User that created this emoji
 * @property {Boolean} require_colons - whether this emoji must be wrapped in colons
 * @property {Boolean} managed - whether this emoji is managed
 */

module.exports = EmojiStructure;
