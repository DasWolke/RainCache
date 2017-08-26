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
        this.channelMapCache = options.cache.channelMap;
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
            case 'GUILD_UPDATE':
                this.emit('debug', `Cached guild ${event.d.id}`);
                await this.guildCache.update(event.d.id, event.d);
                break;
            case 'GUILD_DELETE':
                this.emit('debug', `Guild ${event.d.id} ${event.d.unavailable ? 'is unavailable' : 'was removed'}`);
                if (event.d.unavailable) {
                    await this.guildCache.update(event.d.id, event.d);
                } else {
                    await this.guildCache.remove(event.d.id);
                }
                break;
            case 'CHANNEL_CREATE':
            case 'CHANNEL_UPDATE':
                await this.onChannelCreate(event);
                break;
            case 'CHANNEL_DELETE':
                await this.onChannelDelete(event);
                break;
            default:
                if (event.t !== 'PRESENCE_UPDATE') {
                    this.emit('debug', `Unknown Event ${event.t}`);
                }
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
                await this.channelMapCache.update(channelCreateEvent.d.guild_id, [channelCreateEvent.d.id], 'guild');
                return this.channelCache.update(channelCreateEvent.d.id, channelCreateEvent.d);
            default:
                break;
        }
        if (channelCreateEvent.d.type === 1) {
            if (!channelCreateEvent.d.recipients || channelCreateEvent.d.recipients.length === 0) {
                console.error(`Empty Recipients array for dm ${channelCreateEvent.d.id}`);
                return;
            }
            await this.channelMapCache.update(channelCreateEvent.d.recipients[0].id, [channelCreateEvent.d.id], 'user');
            return this.channelCache.update(channelCreateEvent.d.id, channelCreateEvent.d);
        }
        //ignore channel categories for now.
    }

    async onChannelDelete(channelDeleteEvent) {
        switch (channelDeleteEvent.d.type) {
            case 0:
            case 2:
                await this.channelMapCache.update(channelDeleteEvent.d.guild_id, [channelDeleteEvent.d.id], 'guild', true);
                return this.channelCache.remove(channelDeleteEvent.d.id);
            default:
                break;
        }
        if (channelDeleteEvent.d.type === 1) {
            await this.channelMapCache.update(channelDeleteEvent.d.recipients[0].id, [channelDeleteEvent.d.id], 'user', true);
            return this.channelCache.remove(channelDeleteEvent.d.id);
        }
    }
}

module.exports = EventProcessor;
