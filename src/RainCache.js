'use strict';
let EventProcessor = require('./EventProcessor');
let GuildCache = require('./cache/GuildCache');
let ChannelCache = require('./cache/ChannelCache');

class RainCache {
    constructor(options, inboundConnector, outboundConnector) {
        if (!options.storage) {
            throw new Error('No storage engines were passed');
        }
        if (!options.cacheClasses) {
            options.cacheClasses = {
                guild: GuildCache,
                channel: ChannelCache
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
        this.options.cache = this.createCaches(this.options.storage, this.options.cacheClasses);
        this.eventProcessor = new EventProcessor({
            disabledEvents: this.options.disabledEvents,
            cache: {
                guild: this.options.cache.guild,
                channel: this.options.cache.channel
            }
        });
        if (!this.inbound.ready) {
            await this.inbound.initialize();
        }
        if (this.outbound && !this.outbound.ready) {
            await this.outbound.initialize();
        }
        this.inbound.on('event', async (event) => {
            await this.eventProcessor.inbound(event);
            if (this.outbound) {
                this.outbound.send(event);
            }
        });
        this.ready = true;
    }

    createCaches(engines, cacheClasses) {
        let caches = {};
        if (cacheClasses['role']) {
            let engine = this.getEngine(engines, 'role');
            caches['role'] = new cacheClasses['role'](engine);
        }
        if (cacheClasses['emoji']) {
            let engine = this.getEngine(engines, 'emoji');
            caches['emoji'] = new cacheClasses['emoji'](engine);
        }
        if (cacheClasses['permOverwrite']) {
            let engine = this.getEngine(engines, 'permOverwrite');
            caches['permOverwrite'] = new cacheClasses['permOverwrite'](engine);
        }
        if (cacheClasses['user']) {
            let engine = this.getEngine(engines, 'user');
            caches['user'] = new cacheClasses['user'](engine);
        }
        if (cacheClasses['member']) {
            let engine = this.getEngine(engines, 'member');
            caches['member'] = new cacheClasses['member'](engine);
        }
        if (cacheClasses['channel']) {
            let engine = this.getEngine(engines, 'channel');
            caches['channel'] = new cacheClasses['channel'](engine, caches['permOverwrite'], caches['user']);
        }
        if (cacheClasses['guild']) {
            let engine = this.getEngine(engines, 'guild');
            caches['guild'] = new cacheClasses['guild'](engine, caches['channel'], caches['role'], caches['member'], caches['emoji']);
        }
        return caches;
    }

    getEngine(engines, engine) {
        return engines[engine] || engines['default'];
    }
}

module.exports = RainCache;
