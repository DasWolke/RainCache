'use strict';
let BaseCache = require('./BaseCache');

/**
 * Cache responsible for storing channel related data
 * @extends BaseCache
 */
class ChannelCache extends BaseCache {
    /**
     * Create a new ChanneCache
     *
     * **This class is automatically instantiated by RainCache**
     * @param {StorageEngine} storageEngine - storage engine to use for this cache
     * @param {ChannelMapCache} channelMap - Instantiated ChannelMap class
     * @param {PermissionOverwriteCache} permissionOverwriteCache - Instantiated PermissionOverwriteCache class
     * @param {UserCache} userCache - Instantiated UserCache class
     * @param {Channel} [boundObject] - Optional, may be used to bind a channel object to this cache
     * @property {String} namespace=channel - namespace of the cache, defaults to `channel`
     * @property {ChannelMapCache} guildChannelMap - Instantiated ChannelMap class
     * @property {PermissionOverwriteCache} permissionOverwrites - Instantiated PermissionOverwrite class
     * @property {UserCache} recipients - Instantiated UserCache class
     */
    constructor(storageEngine, channelMap, permissionOverwriteCache, userCache, boundObject) {
        super();
        this.storageEngine = storageEngine;
        this.namespace = 'channel';
        this.channelMap = channelMap;
        this.permissionOverwrites = permissionOverwriteCache;
        this.recipients = userCache;
        if (boundObject) {
            this.bindObject(boundObject);
        }
    }

    /**
     * Get a channel via id
     * @param {String} id - id of the channel
     * @returns {Promise.<ChannelCache|null>} - ChannelCache with bound object or null if nothing was found
     */
    async get(id) {
        if (this.boundObject) {
            return this.boundObject;
        }
        let channel = await this.storageEngine.get(this.buildId(id));
        if (channel) {
            return new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(channel.id), this.recipients, channel);
        } else {
            return null;
        }
    }

    /**
     * Upsert a channel into the cache
     * @param {String} id - id of the channel
     * @param {Object} data - data to insert
     * @returns {Promise.<ChannelCache>}
     */
    async update(id, data) {
        if (this.boundObject) {
            this.bindObject(data); //using bindobject() to assure the data of the class is valid
            await this.update(this.boundObject.id, data);
            return this;
        }
        if (data.guild_id) {
            await this.channelMap.update(data.guild_id, [data.id]);
        } else if (data.recipients) {
            if (data.recipients[0]) {
                await this.channelMap.update(data.recipients[0].id, [data.id], 'user');
            }
        }
        if (data.permission_overwrites) {
            for (let overwrite of data.permission_overwrites) {
                await this.permissionOverwrites.update(overwrite.id, id, overwrite);
            }
        }
        delete data.permission_overwrites;
        delete data.recipients;
        await this.addToIndex(id);
        await this.storageEngine.upsert(this.buildId(id), data);
        let channel = await this.storageEngine.get(this.buildId(id));
        return new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(channel.id), this.recipients, channel);
    }

    /**
     * Remove a channel from the cache
     * @param {String} id - id of the channel
     * @returns {Promise.<void>}
     */
    async remove(id) {
        if (this.boundObject) {
            return this.remove(this.boundObject.id);
        }
        let channel = await this.storageEngine.get(this.buildId(id));
        if (channel) {
            await this.removeFromIndex(id);
            return this.storageEngine.remove(this.buildId(id));
        } else {
            return null;
        }
    }

    /**
     * Filter through the collection of channels
     * @param {Function} fn - Filter function
     * @param {String[]} channelMap - Array of ids used for the filter
     * @returns {Promise.<ChannelCache[]>} - array of channel caches with bound results
     */
    async filter(fn, channelMap) {
        let channels = await this.storageEngine.filter(fn, channelMap, this.namespace);
        return channels.map(c => new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(c.id), this.recipients, c));
    }

    /**
     * Filter through the collection of channels and return on the first result
     * @param {Function} fn - Filter function
     * @param {String[]} channelMap - Array of ids used for the filter
     * @returns {ChannelCache} - First result bound to a channel cache
     */
    async find(fn, channelMap) {
        let channel = await this.storageEngine.find(fn, channelMap, this.namespace);
        return new ChannelCache(this.storageEngine, this.channelMap, this.permissionOverwrites.bindChannel(channel.id), this.recipients, channel);
    }

    /**
     * Add a channel to the channel index
     * @param {String} id - id of the channel
     * @returns {Promise.<void>}
     */
    async addToIndex(id) {
        return this.storageEngine.addToList(this.namespace, id);
    }

    /**
     * Remove a channel from the index
     * @param {String} id - id of the channel
     * @returns {Promise.<void>}
     */
    async removeFromIndex(id) {
        return this.storageEngine.removeFromList(this.namespace, id);
    }

    /**
     * Check if a channel is indexed
     * @param {String} id - id of the channel
     * @returns {Promise.<Boolean>}
     */
    async isIndexed(id) {
        return this.storageEngine.isListMember(this.namespace, id);
    }

    /**
     * Get a list of ids of indexed channels
     * @returns {Promise.<String[]>}
     */
    async getIndexMembers() {
        return this.storageEngine.getListMembers(this.namespace);
    }

    /**
     * Remove the channel index, you should probably not call this at all :<
     * @returns {Promise.<*>}
     */
    async removeIndex() {
        return this.storageEngine.removeList(this.namespace);
    }
}

// To anyone wanting to write a library: JUST COPY THIS SHIT, filling this out manually wasn't fun :<
// https://www.youtube.com/watch?v=LIlZCmETvsY have a weird video to distract yourself from the problems that will come upon ya
/**
 * @typedef {Object} Channel - a discord channel object
 * @property {String} id - id of the channel
 * @property {Number} type - [type](https://discordapp.com/developers/docs/resources/channel#channel-object-channel-types) of channel
 * @property {String} [guild_id] - id of the Guild of the channel
 * @property {Number} [position] - sorting position of the channel
 * @property {PermissionOverwrite[]} [permission_overwrites] - array of permission overwrites for this channel
 * @property {String} [name] - name of the channel
 * @property {String} [topic] - topic of the channel
 * @property {Boolean} [nsfw] - if the channel is nsfw (guild only)
 * @property {String} [last_message_id] - the id of the last message sent in this channel
 * @property {Number} [bitrate] - bitrate of the channel (voice only)
 * @property {Number} [user_limit] - limit of users in a channel (voice only)
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

module.exports = ChannelCache;
