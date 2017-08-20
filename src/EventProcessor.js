'use strict';

class EventProcessor {
    constructor(options) {
        this.options = options || {disabledEvents: {}};
        this.guildCache = options.cache.guild;
        this.channelCache = options.cache.channel;
        this.memberCache = options.cache.member;
        this.roleCache = options.cache.role;
        this.userCache = options.cache.user;
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
                console.log(`Cached guild ${event.d.id}`);
                await this.guildCache.update(event.d.id, event.d);
                break;
            case 'CHANNEL_CREATE':
                break;
        }
    }

    async processReady(readyEvent) {
        let updates = [];
        for (let guild of readyEvent.d.guilds) {
            console.log(`Caching guild ${guild.id} from ready`);
            updates.push(this.guildCache.update(guild.id, guild));
        }
        return Promise.all(updates);
    }
}

module.exports = EventProcessor;
