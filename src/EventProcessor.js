'use strict';
let EventEmitter;
try {
    EventEmitter = require('eventemitter3');
} catch (e) {
    EventEmitter = require('events').EventEmitter;
}

class EventProcessor extends EventEmitter {
    constructor(options) {
        super();
        this.options = options || {disabledEvents: {}};
        this.guildCache = options.cache.guild;
        this.channelCache = options.cache.channel;
        this.memberCache = options.cache.member;
        this.roleCache = options.cache.role;
        this.userCache = options.cache.user;
        this.channelMapCache = options.cache.channelMap || {};
        this.ready = false;
        this.queue = [];
    }

    async inbound(event) {
        if (this.options.disabledEvents[event.t]) {
            return event;
        }
        await this.process(event);
        return event;
    }

    async process(event) {
        switch (event.t) {
            case 'READY':
                await this.processReady(event);
                this.ready = true;
                break;
            case 'GUILD_CREATE':
                this.emit('debug', `Cached guild ${event.d.id}`);
                await this.guildCache.update(event.d.id, event.d);
                break;
            case 'CHANNEL_CREATE':
                console.log(event);
                await this.onChannelCreate(event);
                break;
        }
    }

    async processReady(readyEvent) {
        let updates = [];
        for (let guild of readyEvent.d.guilds) {
            this.emit('debug', `Caching guild ${guild.id} from ready`);
            updates.push(this.guildCache.update(guild.id, guild));
        }
        return Promise.all(updates);
    }

    async onChannelCreate(channelCreateEvent) {
        switch (channelCreateEvent.d.type) {
            case 0:
            case 2:
                if (this.channelMapCache) {
                    await this.channelMapCache.update(channelCreateEvent.d.guild_id, [channelCreateEvent.d.id], 'guild');
                }
                return this.channelCache.update(channelCreateEvent.d.id, channelCreateEvent.d);
            default:
                break;
        }
        if (channelCreateEvent.d.type === 1) {
            if (this.channelMapCache) {
                if (!channelCreateEvent.d.recipients || channelCreateEvent.d.recipients.length === 0) {
                    console.error(`Empty Recipients array for dm ${channelCreateEvent.d.id}`);
                    return;
                }
                await this.channelMapCache.update(channelCreateEvent.d.recipients[0].id, [channelCreateEvent.d.id], 'user');
            }
            return this.channelCache.update(channelCreateEvent.d.id, channelCreateEvent.d);
        }
        //ignore channel categories for now.
    }
}

module.exports = EventProcessor;
