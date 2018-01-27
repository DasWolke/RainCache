'use strict';
let EventProcessor = require('./EventProcessor');
let GuildCache = require('./cache/GuildCache');
let ChannelCache = require('./cache/ChannelCache');
let ChannelMap = require('./cache/ChannelMapCache');
let MemberCache = require('./cache/MemberCache');
let UserCache = require('./cache/UserCache');
let RoleCache = require('./cache/RoleCache');
let EmojiCache = require('./cache/EmojiCache');
let PresenceCache = require('./cache/PresenceCache');
let PermissionsOverwriteCache = require('./cache/PermissionOverwriteCache');
let EventEmitter;
try {
    EventEmitter = require('eventemitter3');
} catch (e) {
    EventEmitter = require('events').EventEmitter;
}

/**
 * RainCache - Main class used for accessing caches via subclasses and initializing the whole library
 * @extends EventEmitter
 */
class RainCache extends EventEmitter {
    /**
     * Create a new Cache instance
     * @param {Object} options Options that should be used by RainCache
     * @param {Object} options.storage - object with storage engines to use for the different cache classes
     * @param {StorageEngine} [options.storage.default] - default storage engine to use when no special storage engine was passed for a class.
     *
     * **Use this option if you do not want to use a different type of storage engine for certain caches**
     *
     * You may also combine options: e.g. a RedisStorageEngine for presence and the rest within mongo, that's no issue.
     *
     * The cache type specific storage engine takes priority over the default one.
     * @param {StorageEngine} [options.storage.guild=options.storage.default] - storage engine used by the guild cache
     * @param {StorageEngine} [options.storage.channel=options.storage.default] - storage engine used by the channel cache
     * @param {StorageEngine} [options.storage.channelMap=options.storage.default] - storage engine used by the channelMap cache
     * @param {StorageEngine} [options.storage.member=options.storage.default] - storage engine used by the member cache
     * @param {StorageEngine} [options.storage.user=options.storage.default] - storage engine used by the user cache
     * @param {StorageEngine} [options.storage.role=options.storage.default] - storage engine used by the role cache
     * @param {StorageEngine} [options.storage.emoji=options.storage.default] - storage engine used by the emoji cache
     * @param {StorageEngine} [options.storage.presence=options.storage.default] - storage engine used by the presence cache
     * @param {StorageEngine} [options.storage.permOverwrite=options.storage.default] - storage engine used by the permission overwrite cache
     * @param {Object} [options.disabledEvents={}] - If you want to disable events from being processed,
     * you can add them here like this: `{'MESSAGE_CREATE':true}`,
     * this would disable any message_creates from being cached
     * @param {Object} [options.cacheClasses] - object with classes (**not objects**) that should be used for each type of data that is cached
     *
     * **RainCache automatically uses default classes when no cache classes are passed, else it will use your classes.**
     * @param {Object} [options.cacheClasses.guild=GuildCache] - cache class to use for guilds, defaults to the GuildCache
     * @param {Object} [options.cacheClasses.channel=ChannelCache] - cache class to use for channels, defaults to ChannelCache
     * @param {Object} [options.cacheClasses.channelMap=ChannelMapCache] - cache class to use for channels, defaults to ChannelMapCache
     * @param {Connector} inboundConnector
     * @param {Connector} outboundConnector
     *
     * @property {Object} options - options that the user passed through the constructor
     * @property {Boolean} ready=false - whether the cache is ready to process events
     * @property {Connector} inbound - Connector used for receiving events
     * @property {Connector} outbound - Connector used for forwarding events
     * @property {Object} cache - Instantiated cache classes
     * @property {GuildCache} cache.guild - Instantiated Guild Cache
     * @property {ChannelCache} cache.channel - Instantiated Channel Cache
     */
    constructor(options, inboundConnector, outboundConnector) {
        super();
        if (!options.storage) {
            throw new Error('No storage engines were passed');
        }
        if (!options.cacheClasses) {
            options.cacheClasses = {
                guild: GuildCache,
                channel: ChannelCache,
                channelMap: ChannelMap,
                member: MemberCache,
                user: UserCache,
                role: RoleCache,
                emoji: EmojiCache,
                presence: PresenceCache,
                permOverwrite: PermissionsOverwriteCache
            };
        }
        if (!options.storage.default) {
            // maybe warn that no default engine was passed ? :thunkong:
        }
        if (!options.disabledEvents) {
            options.disabledEvents = {};
        }
        this.options = options;
        this.ready = false;
        this.inbound = inboundConnector;
        this.outbound = outboundConnector;
    }

    async initialize() {
        try {
            for (let engine in this.options.storage) {
                if (this.options.storage.hasOwnProperty(engine)) {
                    if (!this.options.storage[engine].ready) {
                        await this.options.storage[engine].initialize();
                    }
                }
            }
        } catch (e) {
            throw new Error('Failed to initialize storage engines');
        }
        this.cache = this._createCaches(this.options.storage, this.options.cacheClasses);
        Object.assign(this, this.cache);
        this.eventProcessor = new EventProcessor({
            disabledEvents: this.options.disabledEvents,
            cache: {
                guild: this.cache.guild,
                channel: this.cache.channel,
                channelMap: this.cache.channelMap,
                member: this.cache.member,
                user: this.cache.user,
                role: this.cache.role,
                emoji: this.cache.emoji,
                presence: this.cache.presence,
                permOverwrite: this.cache.permOverwrite
            }
        });
        if (this.inbound && !this.inbound.ready) {
            await this.inbound.initialize();
        }
        if (this.outbound && !this.outbound.ready) {
            await this.outbound.initialize();
        }
        if (this.inbound) {
            this.inbound.on('event', async (event) => {
                try {
                    await this.eventProcessor.inbound(event);
                    if (this.outbound) {
                        await this.outbound.send(event);
                    }
                }
                catch (e) {
                    this.emit('error', e);
                }
            });
        }
        if (this.options.debug) {
            this.eventProcessor.on('debug', (log) => this.emit('debug', log));
        }
        this.ready = true;
    }

    _createCaches(engines, cacheClasses) {
        let caches = {};
        if (cacheClasses['role']) {
            let engine = this._getEngine(engines, 'role');
            caches['role'] = new cacheClasses['role'](engine);
        }
        if (cacheClasses['emoji']) {
            let engine = this._getEngine(engines, 'emoji');
            caches['emoji'] = new cacheClasses['emoji'](engine);
        }
        if (cacheClasses['permOverwrite']) {
            let engine = this._getEngine(engines, 'permOverwrite');
            caches['permOverwrite'] = new cacheClasses['permOverwrite'](engine);
        }
        if (cacheClasses['user']) {
            let engine = this._getEngine(engines, 'user');
            caches['user'] = new cacheClasses['user'](engine);
        }
        if (cacheClasses['member']) {
            let engine = this._getEngine(engines, 'member');
            caches['member'] = new cacheClasses['member'](engine, caches['user']);
        }
        if (cacheClasses['presence']) {
            let engine = this._getEngine(engines, 'presence');
            caches['presence'] = new cacheClasses['presence'](engine, caches['user']);
        }
        if (cacheClasses['channelMap']) {
            let engine = this._getEngine(engines, 'channelMap');
            caches['channelMap'] = new cacheClasses['channelMap'](engine);
        }
        if (cacheClasses['channel']) {
            let engine = this._getEngine(engines, 'channel');
            caches['channel'] = new cacheClasses['channel'](engine, caches['channelMap'], caches['permOverwrite'], caches['user']);
        }
        if (cacheClasses['guild']) {
            let engine = this._getEngine(engines, 'guild');
            caches['guild'] = new cacheClasses['guild'](engine, caches['channel'], caches['role'], caches['member'], caches['emoji'], caches['presence'], caches['channelMap']);
        }
        return caches;
    }

    _getEngine(engines, engine) {
        return engines[engine] || engines['default'];
    }
}

module.exports = RainCache;
