/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EventEmitter } from "events";

type EventTypeMap = {
	"READY": import("discord-typings").ReadyPayload;

	"CHANNEL_CREATE": import("discord-typings").Channel;
	"CHANNEL_UPDATE": EventTypeMap["CHANNEL_CREATE"];
	"CHANNEL_DELETE": EventTypeMap["CHANNEL_CREATE"];
	"CHANNEL_PINS_UPDATE": import("discord-typings").ChannelPinsUpdatePayload;

	"THREAD_CREATE": import("discord-typings").ThreadChannel;
	"THREAD_UPDATE": EventTypeMap["THREAD_CREATE"];
	"THREAD_DELETE": { id: string; guild_id: string; parent_id: string; type: import("discord-typings").ThreadChannel["type"]; };
	"THREAD_LIST_SYNC": import("discord-typings").ThreadListSyncPayload;

	"GUILD_CREATE": import("discord-typings").Guild;
	"GUILD_UPDATE": EventTypeMap["GUILD_CREATE"];
	"GUILD_DELETE": { id: string; unavailable: boolean; };

	"GUILD_BAN_ADD": import("discord-typings").GuildBanAddPayload;
	"GUILD_BAN_REMOVE": import("discord-typings").GuildBanRemovePayload;

	"GUILD_EMOJIS_UPDATE": import("discord-typings").GuildEmojisUpdatePayload;
	"GUILD_STICKERS_UPDATE": import("discord-typings").GuildStickersUpdatePayload;

	"GUILD_MEMBER_ADD": import("discord-typings").Member & { guild_id: string; };
	"GUILD_MEMBER_UPDATE": EventTypeMap["GUILD_MEMBER_ADD"];
	"GUILD_MEMBER_REMOVE": import("discord-typings").GuildMemberRemovePayload;
	"GUILD_MEMBERS_CHUNK": import("discord-typings").GuildMembersChunkPayload;

	"GUILD_ROLE_CREATE": import("discord-typings").GuildRoleCreatePayload;
	"GUILD_ROLE_UPDATE": EventTypeMap["GUILD_ROLE_CREATE"];
	"GUILD_ROLE_DELETE": import("discord-typings").GuildRoleDeletePayload;

	"GUILD_SCHEDULED_EVENT_CREATE": import("discord-typings").GuildScheduledEvent;
	"GUILD_SCHEDULED_EVENT_UPDATE": EventTypeMap["GUILD_SCHEDULED_EVENT_CREATE"];
	"GUILD_SCHEDULED_EVENT_DELETE": EventTypeMap["GUILD_SCHEDULED_EVENT_CREATE"];

	"INTEGRATION_CREATE": import("discord-typings").Integration;
	"INTEGRATION_UPDATE": EventTypeMap["INTEGRATION_CREATE"];

	"INTERACTION_CREATE": import("discord-typings").Interaction;

	"INVITE_CREATE": import("discord-typings").InviteCreatePaylaod;

	"MESSAGE_CREATE": import("discord-typings").Message;
	"MESSAGE_UPDATE": EventTypeMap["MESSAGE_CREATE"];

	"MESSAGE_REACTION_ADD": import("discord-typings").MessageReactionAddPayload;

	"PRESENCE_UPDATE": import("discord-typings").PresenceUpdate;

	"TYPING_START": import("discord-typings").TypingStartPayload;

	"USER_UPDATE": import("discord-typings").User;

	"VOICE_STATE_UPDATE": import("discord-typings").VoiceState;
}

type UnpackRecord<T> = T extends Record<string | number | symbol, infer V> ? V : never;

type Dispatch = UnpackRecord<{ [event in keyof EventTypeMap]: { op: 0; t: event; d: EventTypeMap[event]; s: number; } }>;

interface EventProcessorEvents {
	debug: [string];
}

interface EventProcessor {
	addListener<E extends keyof EventProcessorEvents>(event: E, listener: (...args: EventProcessorEvents[E]) => any): this;
	emit<E extends keyof EventProcessorEvents>(event: E, ...args: EventProcessorEvents[E]): boolean;
	eventNames(): Array<keyof EventProcessorEvents>;
	listenerCount(event: keyof EventProcessorEvents): number;
	listeners(event: keyof EventProcessorEvents): Array<(...args: Array<any>) => any>;
	off<E extends keyof EventProcessorEvents>(event: E, listener: (...args: EventProcessorEvents[E]) => any): this;
	on<E extends keyof EventProcessorEvents>(event: E, listener: (...args: EventProcessorEvents[E]) => any): this;
	once<E extends keyof EventProcessorEvents>(event: E, listener: (...args: EventProcessorEvents[E]) => any): this;
	prependListener<E extends keyof EventProcessorEvents>(event: E, listener: (...args: EventProcessorEvents[E]) => any): this;
	prependOnceListener<E extends keyof EventProcessorEvents>(event: E, listener: (...args: EventProcessorEvents[E]) => any): this;
	rawListeners(event: keyof EventProcessorEvents): Array<(...args: Array<any>) => any>;
	removeAllListeners(event?: keyof EventProcessorEvents): this;
	removeListener<E extends keyof EventProcessorEvents>(event: E, listener: (...args: EventProcessorEvents[E]) => any): this;
}

class EventProcessor extends EventEmitter {
	public options: import("./types").EventProcessorOptions;
	public guildCache: import("./cache/GuildCache").default | undefined;
	public channelCache: import("./cache/ChannelCache").default | undefined;
	public memberCache: import("./cache/MemberCache").default | undefined;
	public roleCache: import("./cache/RoleCache").default | undefined;
	public userCache: import("./cache/UserCache").default | undefined;
	public emojiCache: import("./cache/EmojiCache").default | undefined;
	public channelMapCache: import("./cache/ChannelMapCache").default | undefined;
	public presenceCache: import("./cache/PresenceCache").default | undefined;
	public permOverwriteCache: import("./cache/PermissionOverwriteCache").default | undefined;
	public voiceStateCache: import("./cache/VoiceStateCache").default | undefined;
	public ready: boolean;
	public presenceQueue: {
		[key: string]: import("discord-typings").PresenceUpdate;
	};
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
		}, this.options.presenceInterval).unref();
	}

	public async inbound(event: import("discord-typings").GatewayPayload) {
		if (event.op === 0 && !this.options.disabledEvents[event.t]) await this.process(event as Dispatch);
		return event;
	}

	private async process(event: Dispatch): Promise<void> {
		const typed = event as Dispatch;
		switch (typed.t) {
		case "CHANNEL_CREATE":
		case "CHANNEL_UPDATE":
			switch (typed.d.type) {
			case 0:
			case 2:
			case 5:
			case 10:
			case 11:
			case 12:
			case 13:
			case 14:
			case 15:
				await this.channelMapCache?.update(typed.d.guild_id, [typed.d.id], "guild");
				await this.channelCache?.update(typed.d.id, typed.d);
				break;
			default:
				break;
			}
			if (typed.d.type === 1) {
				if (!typed.d.recipients || typed.d.recipients.length === 0) return void this.emit("debug", `Empty Recipients array for dm ${typed.d.id}`);
				await this.channelMapCache?.update(typed.d.recipients[0].id, [typed.d.id], "user");
				return void await this.channelCache?.update(typed.d.id, typed.d);
			}
			//ignore channel categories for now.
			break;
		case "CHANNEL_DELETE":
			switch (typed.d.type) {
			case 0:
			case 2:
			case 5:
			case 10:
			case 11:
			case 12:
			case 13:
			case 14:
			case 15:
				await this.channelMapCache?.update(typed.d.guild_id, [typed.d.id], "guild", true);
				await this.channelCache?.remove(typed.d.id);
				break;
			default:
				break;
			}
			if (typed.d.type === 1) {
				await this.channelMapCache?.update(typed.d.recipients[0].id, [typed.d.id], "user", true);
				return void await this.channelCache?.remove(typed.d.id);
			}
			break;
		case "GUILD_CREATE":
		case "GUILD_UPDATE":
			this.emit("debug", `Cached guild ${typed.d.id}|${typed.d.name}`);
			await this.guildCache?.update(typed.d.id, typed.d);
			break;
		case "GUILD_DELETE":
			this.emit("debug", `Guild ${typed.d.id} ${typed.d.unavailable ? "is unavailable" : "was removed"}`);
			if (typed.d.unavailable) await this.guildCache?.update(typed.d.id, typed.d);
			else await this.guildCache?.remove(typed.d.id);
			break;
		case "GUILD_MEMBER_ADD":
		case "GUILD_MEMBER_UPDATE":
			if (typed.d.user) await this.memberCache?.update(typed.d.user.id, typed.d.guild_id, typed.d);
			break;
		case "GUILD_MEMBER_REMOVE":
			await this.memberCache?.remove(typed.d.user.id, typed.d.guild_id);
			break;
		case "GUILD_MEMBERS_CHUNK":
			await Promise.all(typed.d.members.map(m => this.memberCache?.update(m.user!.id, typed.d.guild_id, m)));
			this.emit("debug", `Cached ${typed.d.members.length} Members from Guild Member Chunk`);
			break;
		case "GUILD_ROLE_CREATE":
		case "GUILD_ROLE_UPDATE":
			await this.roleCache?.update(typed.d.role.id, typed.d.guild_id, typed.d.role);
			break;
		case "GUILD_ROLE_DELETE":
			await this.roleCache?.remove(typed.d.guild_id, typed.d.role_id);
			break;
		case "GUILD_EMOJIS_UPDATE": {
			let oldEmotes = await this.emojiCache?.filter(() => true, typed.d.guild_id);
			if (!oldEmotes) oldEmotes = [];
			for (const emoji of typed.d.emojis) {
				const oldEmote = oldEmotes.find(e => e.boundObject!.id === emoji.id);
				if (!oldEmote || oldEmote.boundObject!.id !== emoji.id) {
					await this.emojiCache?.update(emoji.id!, typed.d.guild_id, emoji);
				}
			}
			for (const oldEmote of oldEmotes) {
				const newEmote = typed.d.emojis.find(e => e.id === oldEmote.boundObject!.id);
				if (!newEmote) {
					await this.emojiCache?.remove(oldEmote.boundObject!.id!, typed.d.guild_id);
				}
			}
			break;
		}
		case "MESSAGE_CREATE":
		case "MESSAGE_UPDATE":
			if (typed.d.webhook_id) return;
			if (typed.d.member && typed.d.author) await this.memberCache?.update(typed.d.author.id, typed.d.guild_id, { guild_id: typed.d.guild_id, user: typed.d.author, id: typed.d.author.id, ...typed.d.member });
			else if (typed.d.author) await this.userCache?.update(typed.d.author.id, typed.d.author);

			if (typed.d.mentions && typed.d.mentions.length > 0 && typed.d.guild_id) {
				await Promise.all(typed.d.mentions.map(user => {
					if (user.member) this.memberCache?.update(user.id, typed.d.guild_id, user.member);
					else this.userCache?.update(user.id, user);
				}));
			}
			break;
		case "PRESENCE_UPDATE":
			this.handlePresenceUpdate(typed.d);
			break;
		case "READY":
			await Promise.all([
				this.userCache?.update("self", { id: typed.d.user.id }),
				this.userCache?.update(typed.d.user.id, typed.d.user),
				...typed.d.guilds.map(g => {
					this.emit("debug", `Caching guild ${g.id} from ready`);
					return this.guildCache?.update(g.id, g);
				})]);
			this.ready = true;
			break;
		case "USER_UPDATE":
			await this.userCache?.update(typed.d.id, typed.d);
			break;
		case "VOICE_STATE_UPDATE":
			if (!typed.d.guild_id) return;
			if (typed.d.member && typed.d.user_id && typed.d.guild_id) await this.memberCache?.update(typed.d.user_id, typed.d.guild_id, { guild_id: typed.d.guild_id, ...typed.d.member });

			if (typed.d.channel_id != null) await this.voiceStateCache?.update(typed.d.user_id, typed.d.guild_id, typed.d);
			else await this.voiceStateCache?.remove(typed.d.user_id, typed.d.guild_id);
			break;
		case "CHANNEL_PINS_UPDATE":
			if (typed.d.guild_id) await this.channelMapCache?.update(typed.d.guild_id, [typed.d.channel_id], "guild");
			await this.channelCache?.update(typed.d.channel_id, { last_pin_timestamp: typed.d.last_pin_timestamp });
			break;
		case "GUILD_BAN_ADD":
		case "GUILD_BAN_REMOVE":
			await this.userCache?.update(typed.d.user.id, typed.d.user);
			break;
		case "GUILD_SCHEDULED_EVENT_CREATE":
		case "GUILD_SCHEDULED_EVENT_UPDATE":
		case "GUILD_SCHEDULED_EVENT_DELETE":
			if (typed.d.creator) await this.userCache?.update(typed.d.creator.id, typed.d.creator);
			break;
		case "INTEGRATION_CREATE":
		case "INTEGRATION_UPDATE":
			if (typed.d.user) await this.userCache?.update(typed.d.user.id, typed.d.user);
			break;
		case "INTERACTION_CREATE":
			if (typed.d.member) await this.memberCache?.update(typed.d.member.user!.id, typed.d.guild_id!, typed.d.member);
			else await this.userCache?.update(typed.d.user!.id, typed.d.user!);
			break;
		case "INVITE_CREATE":
			if (typed.d.target_user) await this.userCache?.update(typed.d.target_user.id, typed.d.target_user);
			break;
		case "MESSAGE_REACTION_ADD":
			if (typed.d.member) await this.memberCache?.update(typed.d.user_id, typed.d.guild_id!, typed.d.member);
			break;
		case "THREAD_CREATE":
		case "THREAD_UPDATE":
			if (typed.d.member) await this.memberCache?.update(typed.d.member.id!, typed.d.guild_id, typed.d.member);
			break;
		case "THREAD_LIST_SYNC":
			await Promise.all(typed.d.threads.map(t => this.channelCache?.update(t.id, t)));
			break;
		case "TYPING_START":
			if (typed.d.member) await this.memberCache?.update(typed.d.member.user!.id, typed.d.guild_id!, typed.d.member);
			break;
		default:
			this.emit("debug", `Unknown Event ${typed.t}`);
			break;
		}
	}

	private handlePresenceUpdate(presenceEvent: import("discord-typings").PresenceUpdate) {
		this.presenceQueue[presenceEvent.user.id] = presenceEvent;
	}

	private async flushQueue() {
		const queue = this.presenceQueue;
		this.presenceQueue = {};
		const presenceUpdatePromises: Array<Promise<any> | undefined> = [];
		for (const key in queue) {
			if (Object.hasOwnProperty.call(queue, key)) {
				presenceUpdatePromises.push(this.presenceCache?.update(key, queue[key]));
			}
		}
		await Promise.all(presenceUpdatePromises);
		this.emit("debug", `Flushed presence update queue with ${presenceUpdatePromises.length} updates`);
	}
}

export default EventProcessor;
