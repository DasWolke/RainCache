const BaseStructure = require('./BaseStructure');

/**
 * Structure used for holding an array with a list of channel ids either belonging to a guild or a user
 */
class ChannelMapStructure extends BaseStructure {
    /**
     * Creates a new [ChannelMap](?api=RainCache#ChannelMap) Structure, which gives you access to all properties of the based [ChannelMap](?api=RainCache#ChannelMap) object
     * @param {String} id - id of the channelmap parent entity (either user id or guild id)
     * @param {ChannelMap} data - an internal channelmap structure
     * @param {ChannelMapCache} cache - a [ChannelMapCache](?api=RainCache#ChannelMapCache) instance, allows you to access the cache this object originated from
     * @extends BaseStructure
     * @extends ChannelMap
     */
    constructor(id, data, cache) {
        super(id, data, cache);
    }
}

module.exports = ChannelMapStructure;

/**
 * @typedef {Object} ChannelMap - an internal channelmap object used by raincache
 * @property {String} id - id of the channelmap parent entity (either user id or guild id)
 * @property {String} type=guild - type of the channelmap (either "user" or "guild")
 * @property {String[]} channels - array of channel ids associated with the parent entity
 */
