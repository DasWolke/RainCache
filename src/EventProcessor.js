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
        this.options = options || {disabledEvents: {}, presenceInterval: 1000 * 5};
        if (!this.options.presenceInterval) {
            this.options.presenceInterval = 1000 * 5;
        }
        this.guildCache = options.cache.guild;
        this.channelCache = options.cache.channel;
        this.memberCache = options.cache.member;
        this.roleCache = options.cache.role;
        this.userCache = options.cache.user;
        this.emojiCache = options.cache.emoji;
        this.channelMapCache = options.cache.channelMap;
        this.presenceCache = options.cache.presence;
        this.ready = false;
        this.presenceQueue = {};
        this.presenceFlush = setInterval(async () => {
            await this.flushQueue();
        }, this.options.presenceInterval);
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
                this.emit('debug', `Cached guild ${event.d.id}|${event.d.name}`);
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
                // console.log(event);
                // console.log(event.d.permission_overwrites);
                await this.onChannelCreate(event);
                break;
            case 'CHANNEL_DELETE':
                await this.onChannelDelete(event);
                break;
            case 'GUILD_MEMBER_ADD':
            case 'GUILD_MEMBER_UPDATE':
                await this.memberCache.update(event.d.user.id, event.d.guild_id, event.d);
                break;
            case 'GUILD_MEMBER_REMOVE':
                await this.memberCache.remove(event.d.user.id, event.d.guild_id);
                break;
            case 'GUILD_MEMBERS_CHUNK': {
                let guildMemberChunkPromises = [];
                for (let member of event.d.members) {
                    guildMemberChunkPromises.push(this.memberCache.update(member.user.id, event.d.guild_id, member));
                }
                await Promise.all(guildMemberChunkPromises);
                this.emit('debug', `Cached ${guildMemberChunkPromises.length} Members from Guild Member Chunk`);
                break;
            }
            case 'USER_UPDATE':
                await this.userCache.update(event.d.id, event.d);
                break;
            case 'PRESENCE_UPDATE':
                this.handlePresenceUpdate(event.d);
                break;
            case 'GUILD_ROLE_CREATE':
            case 'GUILD_ROLE_UPDATE':
                await this.roleCache.update(event.d.role.id, event.d.guild_id, event.d.role);
                break;
            case 'GUILD_ROLE_DELETE':
                await this.roleCache.remove(event.d.guild_id, event.d.role_id);
                break;
            case 'GUILD_EMOJIS_UPDATE': {
                let oldEmotes = await this.emojiCache.filter(() => true, event.d.guild_id);
                if (!oldEmotes || oldEmotes.length === 0) {
                    oldEmotes = [];
                }
                for (let emoji of event.d.emojis) {
                    let oldEmote = oldEmotes.find(e => e.id === emoji.id);
                    if (!oldEmote || oldEmote !== emoji) {
                        await this.emojiCache.update(emoji.id, event.d.guild_id, emoji);
                    }
                }
                for (let oldEmote of oldEmotes) {
                    let newEmote = event.d.emojis.find(e => e.id === oldEmote.id);
                    if (!newEmote) {
                        await this.emojiCache.remove(oldEmote.id, event.d.guild_id);
                    }
                }
                break;
            }
            default:
                if (event.t !== 'PRESENCE_UPDATE') {
                    this.emit('debug', `Unknown Event ${event.t}`);
                }
                break;
        }
    }

    handlePresenceUpdate(presenceEvent) {
        if (presenceEvent.roles) {
            delete presenceEvent.roles;
        }
        if (presenceEvent.guild_id) {
            delete presenceEvent.guild_id;
        }
        if (this.presenceQueue[presenceEvent.user.id]) {
            this.presenceQueue[presenceEvent.user.id] = Object.assign(this.presenceQueue[presenceEvent.user.id], {
                status: presenceEvent.status,
                game: presenceEvent.game,
                id: presenceEvent.user.id
            });
        } else {
            this.presenceQueue[presenceEvent.user.id] = {
                status: presenceEvent.status,
                game: presenceEvent.game,
                id: presenceEvent.user.id
            };
        }
    }

    async processReady(readyEvent) {
        let updates = [];
        updates.push(this.userCache.update('self', {id: readyEvent.d.user.id}));
        updates.push(this.userCache.update(readyEvent.d.user.id, readyEvent.d.user));
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
            case 4:
                await this.channelMapCache.update(channelCreateEvent.d.guild_id, [channelCreateEvent.d.id], 'guild');
                // this.emit('debug', `Caching guild channel ${channelCreateEvent.d.id}`);
                return this.channelCache.update(channelCreateEvent.d.id, channelCreateEvent.d);
            default:
                break;
        }
        if (channelCreateEvent.d.type === 1) {
            if (!channelCreateEvent.d.recipients || channelCreateEvent.d.recipients.length === 0) {
                console.error(`Empty Recipients array for dm ${channelCreateEvent.d.id}`);
                return;
            }
            // this.emit('debug', `Caching dm channel ${channelCreateEvent.d.id}`);
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

    async flushQueue() {
        let queue = this.presenceQueue;
        this.presenceQueue = {};
        let presenceUpdatePromises = [];
        for (let key in queue) {
            if (queue.hasOwnProperty(key)) {
                presenceUpdatePromises.push(this.presenceCache.update(key, queue[key]));
            }
        }
        await Promise.all(presenceUpdatePromises);
        this.emit('debug', `Flushed presence update queue with ${presenceUpdatePromises.length} updates`);
    }
}

module.exports = EventProcessor;
