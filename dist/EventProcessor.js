"use strict";
const events_1 = require("events");
class EventProcessor extends events_1.EventEmitter {
    constructor(options = { disabledEvents: {}, presenceInterval: 1000 * 5 }) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        super();
        this.options = options;
        if (!this.options.presenceInterval) {
            this.options.presenceInterval = 1000 * 5;
        }
        this.guildCache = (_a = options.cache) === null || _a === void 0 ? void 0 : _a.guild;
        this.channelCache = (_b = options.cache) === null || _b === void 0 ? void 0 : _b.channel;
        this.memberCache = (_c = options.cache) === null || _c === void 0 ? void 0 : _c.member;
        this.roleCache = (_d = options.cache) === null || _d === void 0 ? void 0 : _d.role;
        this.userCache = (_e = options.cache) === null || _e === void 0 ? void 0 : _e.user;
        this.emojiCache = (_f = options.cache) === null || _f === void 0 ? void 0 : _f.emoji;
        this.channelMapCache = (_g = options.cache) === null || _g === void 0 ? void 0 : _g.channelMap;
        this.presenceCache = (_h = options.cache) === null || _h === void 0 ? void 0 : _h.presence;
        this.permOverwriteCache = (_j = options.cache) === null || _j === void 0 ? void 0 : _j.permOverwrite;
        this.voiceStateCache = (_k = options.cache) === null || _k === void 0 ? void 0 : _k.voiceState;
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        switch (event.t) {
            case "READY":
                await this.processReady(event);
                this.ready = true;
                break;
            case "GUILD_CREATE":
            case "GUILD_UPDATE":
                this.emit("debug", `Cached guild ${event.d.id}|${event.d.name}`);
                await ((_a = this.guildCache) === null || _a === void 0 ? void 0 : _a.update(event.d.id, event.d));
                break;
            case "GUILD_DELETE":
                this.emit("debug", `Guild ${event.d.id} ${event.d.unavailable ? "is unavailable" : "was removed"}`);
                if (event.d.unavailable) {
                    await ((_b = this.guildCache) === null || _b === void 0 ? void 0 : _b.update(event.d.id, event.d));
                }
                else {
                    await ((_c = this.guildCache) === null || _c === void 0 ? void 0 : _c.remove(event.d.id));
                }
                break;
            case "CHANNEL_CREATE":
            case "CHANNEL_UPDATE":
                await this.onChannelCreate(event);
                break;
            case "CHANNEL_DELETE":
                await this.onChannelDelete(event);
                break;
            case "GUILD_MEMBER_ADD":
            case "GUILD_MEMBER_UPDATE":
                await ((_d = this.memberCache) === null || _d === void 0 ? void 0 : _d.update(event.d.user.id, event.d.guild_id, event.d));
                break;
            case "GUILD_MEMBER_REMOVE":
                await ((_e = this.memberCache) === null || _e === void 0 ? void 0 : _e.remove(event.d.user.id, event.d.guild_id));
                break;
            case "GUILD_MEMBERS_CHUNK": {
                const guildMemberChunkPromises = [];
                for (const member of event.d.members) {
                    guildMemberChunkPromises.push((_f = this.memberCache) === null || _f === void 0 ? void 0 : _f.update(member.user.id, event.d.guild_id, member));
                }
                await Promise.all(guildMemberChunkPromises);
                this.emit("debug", `Cached ${guildMemberChunkPromises.length} Members from Guild Member Chunk`);
                break;
            }
            case "USER_UPDATE":
                await ((_g = this.userCache) === null || _g === void 0 ? void 0 : _g.update(event.d.id, event.d));
                break;
            case "PRESENCE_UPDATE":
                this.handlePresenceUpdate(event.d);
                break;
            case "GUILD_ROLE_CREATE":
            case "GUILD_ROLE_UPDATE":
                await ((_h = this.roleCache) === null || _h === void 0 ? void 0 : _h.update(event.d.role.id, event.d.guild_id, event.d.role));
                break;
            case "GUILD_ROLE_DELETE":
                await ((_j = this.roleCache) === null || _j === void 0 ? void 0 : _j.remove(event.d.guild_id, event.d.role_id));
                break;
            case "GUILD_EMOJIS_UPDATE": {
                let oldEmotes = await ((_k = this.emojiCache) === null || _k === void 0 ? void 0 : _k.filter(() => true, event.d.guild_id));
                if (!oldEmotes || oldEmotes.length === 0) {
                    oldEmotes = [];
                }
                for (const emoji of event.d.emojis) {
                    const oldEmote = oldEmotes.find(e => e.id === emoji.id);
                    if (!oldEmote || oldEmote !== emoji) {
                        await ((_l = this.emojiCache) === null || _l === void 0 ? void 0 : _l.update(emoji.id, event.d.guild_id, emoji));
                    }
                }
                for (const oldEmote of oldEmotes) {
                    const newEmote = event.d.emojis.find(e => e.id === oldEmote.id);
                    if (!newEmote) {
                        await this.emojiCache.remove(oldEmote.id, event.d.guild_id);
                    }
                }
                break;
            }
            case "MESSAGE_CREATE": {
                if (event.d.author && !event.d.webhook_id) {
                    await ((_m = this.userCache) === null || _m === void 0 ? void 0 : _m.update(event.d.author.id, event.d.author));
                }
                break;
            }
            default:
                if (event.t !== "PRESENCE_UPDATE") {
                    this.emit("debug", `Unknown Event ${event.t}`);
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
                id: presenceEvent.user.id,
                user: presenceEvent.user
            });
        }
        else {
            this.presenceQueue[presenceEvent.user.id] = {
                status: presenceEvent.status,
                game: presenceEvent.game,
                id: presenceEvent.user.id,
                user: presenceEvent.user
            };
        }
    }
    async processReady(readyEvent) {
        var _a, _b, _c;
        const updates = [];
        updates.push((_a = this.userCache) === null || _a === void 0 ? void 0 : _a.update("self", { id: readyEvent.d.user.id }));
        updates.push((_b = this.userCache) === null || _b === void 0 ? void 0 : _b.update(readyEvent.d.user.id, readyEvent.d.user));
        for (const guild of readyEvent.d.guilds) {
            this.emit("debug", `Caching guild ${guild.id} from ready`);
            updates.push((_c = this.guildCache) === null || _c === void 0 ? void 0 : _c.update(guild.id, guild));
        }
        return Promise.all(updates);
    }
    async onChannelCreate(channelCreateEvent) {
        var _a, _b, _c, _d;
        switch (channelCreateEvent.d.type) {
            case 0:
            case 2:
            case 4:
                await ((_a = this.channelMapCache) === null || _a === void 0 ? void 0 : _a.update(channelCreateEvent.d.guild_id, [channelCreateEvent.d.id], "guild"));
                return (_b = this.channelCache) === null || _b === void 0 ? void 0 : _b.update(channelCreateEvent.d.id, channelCreateEvent.d);
            default:
                break;
        }
        if (channelCreateEvent.d.type === 1) {
            if (!channelCreateEvent.d.recipients || channelCreateEvent.d.recipients.length === 0) {
                this.emit("debug", `Empty Recipients array for dm ${channelCreateEvent.d.id}`);
                return;
            }
            await ((_c = this.channelMapCache) === null || _c === void 0 ? void 0 : _c.update(channelCreateEvent.d.recipients[0].id, [channelCreateEvent.d.id], "user"));
            return (_d = this.channelCache) === null || _d === void 0 ? void 0 : _d.update(channelCreateEvent.d.id, channelCreateEvent.d);
        }
    }
    async onChannelDelete(channelDeleteEvent) {
        var _a, _b, _c, _d;
        switch (channelDeleteEvent.d.type) {
            case 0:
            case 2:
                await ((_a = this.channelMapCache) === null || _a === void 0 ? void 0 : _a.update(channelDeleteEvent.d.guild_id, [channelDeleteEvent.d.id], "guild", true));
                return (_b = this.channelCache) === null || _b === void 0 ? void 0 : _b.remove(channelDeleteEvent.d.id);
            default:
                break;
        }
        if (channelDeleteEvent.d.type === 1) {
            await ((_c = this.channelMapCache) === null || _c === void 0 ? void 0 : _c.update(channelDeleteEvent.d.recipients[0].id, [channelDeleteEvent.d.id], "user", true));
            return (_d = this.channelCache) === null || _d === void 0 ? void 0 : _d.remove(channelDeleteEvent.d.id);
        }
    }
    async flushQueue() {
        var _a;
        const queue = this.presenceQueue;
        this.presenceQueue = {};
        const presenceUpdatePromises = [];
        for (const key in queue) {
            if (queue.hasOwnProperty(key)) {
                presenceUpdatePromises.push((_a = this.presenceCache) === null || _a === void 0 ? void 0 : _a.update(key, queue[key]));
            }
        }
        await Promise.all(presenceUpdatePromises);
        this.emit("debug", `Flushed presence update queue with ${presenceUpdatePromises.length} updates`);
    }
}
module.exports = EventProcessor;
