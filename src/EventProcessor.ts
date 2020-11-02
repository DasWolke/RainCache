import { EventEmitter } from "events";

class EventProcessor extends EventEmitter {
	public options: import("./types").EventProcessorOptions;
	public guildCache?: import("./cache/GuildCache");
	public channelCache?: import("./cache/ChannelCache");
	public memberCache?: import("./cache/MemberCache");
	public roleCache?: import("./cache/RoleCache");
	public userCache?: import("./cache/UserCache");
	public emojiCache?: import("./cache/EmojiCache");
	public channelMapCache?: import("./cache/ChannelMapCache");
	public presenceCache?: import("./cache/PresenceCache");
	public permOverwriteCache?: import("./cache/PermissionOverwriteCache");
	public voiceStateCache?: import("./cache/VoiceStateCache");
	public ready: boolean;
	public presenceQueue: any;
	public presenceFlush: NodeJS.Timeout;

	public constructor(options: import("./types").EventProcessorOptions = { disabledEvents: {}, presenceInterval: 1000 * 5 }) {
		super();
		this.options = options;
		if (!this.options.presenceInterval) {
			this.options.presenceInterval = 1000 * 5;
		}
		this.guildCache = options.cache?.guild;
		this.channelCache = options.cache?.channel;
		this.memberCache = options.cache?.member;
		this.roleCache = options.cache?.role;
		this.userCache = options.cache?.user;
		this.emojiCache = options.cache?.emoji;
		this.channelMapCache = options.cache?.channelMap;
		this.presenceCache = options.cache?.presence;
		this.permOverwriteCache = options.cache?.permOverwrite;
		this.voiceStateCache = options.cache?.voiceState;
		this.ready = false;
		this.presenceQueue = {};
		this.presenceFlush = setInterval(async () => {
			await this.flushQueue();
		}, this.options.presenceInterval);
	}

	public async inbound(event: import("./types").DiscordPacket) {
		if (this.options.disabledEvents[event.t]) {
			return event;
		}
		await this.process(event);
		return event;
	}

	private async process(event: import("./types").DiscordPacket) {
		switch (event.t) {
		case "READY":
			await this.processReady(event);
			this.ready = true;
			break;
		case "GUILD_CREATE":
		case "GUILD_UPDATE":
			this.emit("debug", `Cached guild ${event.d.id}|${event.d.name}`);
			await this.guildCache?.update(event.d.id, event.d);
			break;
		case "GUILD_DELETE":
			this.emit("debug", `Guild ${event.d.id} ${event.d.unavailable ? "is unavailable" : "was removed"}`);
			if (event.d.unavailable) {
				await this.guildCache?.update(event.d.id, event.d);
			} else {
				await this.guildCache?.remove(event.d.id);
			}
			break;
		case "CHANNEL_CREATE":
		case "CHANNEL_UPDATE":
			// console.log(event);
			// console.log(event.d.permission_overwrites);
			await this.onChannelCreate(event);
			break;
		case "CHANNEL_DELETE":
			await this.onChannelDelete(event);
			break;
		case "GUILD_MEMBER_ADD":
		case "GUILD_MEMBER_UPDATE":
			await this.memberCache?.update(event.d.user.id, event.d.guild_id, event.d);
			break;
		case "GUILD_MEMBER_REMOVE":
			await this.memberCache?.remove(event.d.user.id, event.d.guild_id);
			break;
		case "GUILD_MEMBERS_CHUNK": {
			const guildMemberChunkPromises: Array<Promise<any> | undefined> = [];
			for (const member of event.d.members) {
				guildMemberChunkPromises.push(this.memberCache?.update(member.user.id, event.d.guild_id, member));
			}
			await Promise.all(guildMemberChunkPromises);
			this.emit("debug", `Cached ${guildMemberChunkPromises.length} Members from Guild Member Chunk`);
			break;
		}
		case "USER_UPDATE":
			await this.userCache?.update(event.d.id, event.d);
			break;
		case "PRESENCE_UPDATE":
			this.handlePresenceUpdate(event.d);
			break;
		case "GUILD_ROLE_CREATE":
		case "GUILD_ROLE_UPDATE":
			await this.roleCache?.update(event.d.role.id, event.d.guild_id, event.d.role);
			break;
		case "GUILD_ROLE_DELETE":
			await this.roleCache?.remove(event.d.guild_id, event.d.role_id);
			break;
		case "GUILD_EMOJIS_UPDATE": {
			let oldEmotes = await this.emojiCache?.filter(() => true, event.d.guild_id);
			if (!oldEmotes || oldEmotes.length === 0) {
				oldEmotes = [];
			}
			for (const emoji of event.d.emojis) {
				// @ts-ignore
				const oldEmote = oldEmotes.find(e => e.id === emoji.id);
				if (!oldEmote || oldEmote !== emoji) {
					await this.emojiCache?.update(emoji.id, event.d.guild_id, emoji);
				}
			}
			for (const oldEmote of oldEmotes) {
				// @ts-ignore
				const newEmote = event.d.emojis.find(e => e.id === oldEmote.id);
				if (!newEmote) {
					// @ts-ignore
					await this.emojiCache.remove(oldEmote.id, event.d.guild_id);
				}
			}
			break;
		}
		case "MESSAGE_CREATE": {
			if (event.d.webhook_id) return;
			if (event.d.member && event.d.author) await this.memberCache?.update(event.d.author.id, event.d.guild_id, { guild_id: event.d.guild_id, user: event.d.author, id: event.d.author.id, ...event.d.member });
			else if (event.d.author) await this.userCache?.update(event.d.author.id, event.d.author);

			if (event.d.mentions && event.d.mentions.length > 0 && event.d.guild_id) {
				await Promise.all(event.d.mentions.map(user => {
					if (user.member) this.memberCache?.update(user.id, event.d.guild_id, user.member);
					else this.userCache?.update(user.id, user);
				}));
			}
			break;
		}
		case "VOICE_STATE_UPDATE": {
			if (!event.d.guild_id) return;
			if (event.d.member && event.d.user_id && event.d.guild_id) await this.memberCache?.update(event.d.user_id, event.d.guild_id, { guild_id: event.d.guild_id, ...event.d.member });

			if (event.d.channel_id != null) await this.voiceStateCache?.update(event.d.user_id, event.d.guild_id, event.d);
			else await this.voiceStateCache?.remove(event.d.user_id, event.d.guild_id);
			break;
		}
		default:
			if (event.t !== "PRESENCE_UPDATE") {
				this.emit("debug", `Unknown Event ${event.t}`);
			}
			break;
		}
	}

	private handlePresenceUpdate(presenceEvent: import("@amanda/discordtypings").PresenceData & { status: number }) {
		if (presenceEvent.roles) {
			// @ts-ignore
			delete presenceEvent.roles;
		}
		if (presenceEvent.guild_id) {
			// @ts-ignore
			delete presenceEvent.guild_id;
		}
		if (this.presenceQueue[presenceEvent.user.id]) {
			this.presenceQueue[presenceEvent.user.id] = Object.assign(this.presenceQueue[presenceEvent.user.id], {
				status: presenceEvent.status,
				game: presenceEvent.game,
				id: presenceEvent.user.id,
				user: presenceEvent.user
			});
		} else {
			this.presenceQueue[presenceEvent.user.id] = {
				status: presenceEvent.status,
				game: presenceEvent.game,
				id: presenceEvent.user.id,
				user: presenceEvent.user
			};
		}
	}

	private async processReady(readyEvent: any) {
		const updates: Array<Promise<any> | undefined> = [];
		// @ts-ignore
		updates.push(this.userCache?.update("self", { id: readyEvent.d.user.id }));
		updates.push(this.userCache?.update(readyEvent.d.user.id, readyEvent.d.user));
		for (const guild of readyEvent.d.guilds) {
			this.emit("debug", `Caching guild ${guild.id} from ready`);
			updates.push(this.guildCache?.update(guild.id, guild));
		}
		return Promise.all(updates);
	}

	private async onChannelCreate(channelCreateEvent: any) {
		switch (channelCreateEvent.d.type) {
		case 0:
		case 2:
		case 4:
			await this.channelMapCache?.update(channelCreateEvent.d.guild_id, [channelCreateEvent.d.id], "guild");
			// this.emit('debug', `Caching guild channel ${channelCreateEvent.d.id}`);
			return this.channelCache?.update(channelCreateEvent.d.id, channelCreateEvent.d);
		default:
			break;
		}
		if (channelCreateEvent.d.type === 1) {
			if (!channelCreateEvent.d.recipients || channelCreateEvent.d.recipients.length === 0) {
				this.emit("debug", `Empty Recipients array for dm ${channelCreateEvent.d.id}`);
				return;
			}
			// this.emit('debug', `Caching dm channel ${channelCreateEvent.d.id}`);
			await this.channelMapCache?.update(channelCreateEvent.d.recipients[0].id, [channelCreateEvent.d.id], "user");
			return this.channelCache?.update(channelCreateEvent.d.id, channelCreateEvent.d);
		}
		//ignore channel categories for now.
	}

	private async onChannelDelete(channelDeleteEvent: any) {
		switch (channelDeleteEvent.d.type) {
		case 0:
		case 2:
			await this.channelMapCache?.update(channelDeleteEvent.d.guild_id, [channelDeleteEvent.d.id], "guild", true);
			return this.channelCache?.remove(channelDeleteEvent.d.id);
		default:
			break;
		}
		if (channelDeleteEvent.d.type === 1) {
			await this.channelMapCache?.update(channelDeleteEvent.d.recipients[0].id, [channelDeleteEvent.d.id], "user", true);
			return this.channelCache?.remove(channelDeleteEvent.d.id);
		}
	}

	private async flushQueue() {
		const queue = this.presenceQueue;
		this.presenceQueue = {};
		const presenceUpdatePromises: Array<Promise<any> | undefined> = [];
		for (const key in queue) {
			// eslint-disable-next-line no-prototype-builtins
			if (queue.hasOwnProperty(key)) {
				presenceUpdatePromises.push(this.presenceCache?.update(key, queue[key]));
			}
		}
		await Promise.all(presenceUpdatePromises);
		this.emit("debug", `Flushed presence update queue with ${presenceUpdatePromises.length} updates`);
	}
}

export = EventProcessor;
