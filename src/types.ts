import BaseStorageEngine from "./storageEngine/BaseStorageEngine";

export type AMQPOptions = {
	/**
	 * amqp host to connect to
	 */
	amqpUrl: string;
	/**
	 * amqp queue to use for receiving events
	 */
	amqpQueue: string;
	/**
	 * amqp queue to use for sending events
	 */
	sendQueue?: string;
}

export type ChannelMap = {
	id: string;
	type: "guild" | "user";
	channels: Array<string>;
}

export interface Caches {
	guild: import("./cache/GuildCache").default;
	channel: import("./cache/ChannelCache").default;
	member: import("./cache/MemberCache").default;
	role: import("./cache/RoleCache").default;
	user: import("./cache/UserCache").default;
	emoji: import("./cache/EmojiCache").default;
	channelMap: import("./cache/ChannelMapCache").default;
	presence: import("./cache/PresenceCache").default;
	permOverwrite: import("./cache/PermissionOverwriteCache").default;
	voiceState: import("./cache/VoiceStateCache").default;
}

export interface CacheTypes {
	guild: typeof import("./cache/GuildCache").default;
	channel: typeof import("./cache/ChannelCache").default;
	member: typeof import("./cache/MemberCache").default;
	role: typeof import("./cache/RoleCache").default;
	user: typeof import("./cache/UserCache").default;
	emoji: typeof import("./cache/EmojiCache").default;
	channelMap: typeof import("./cache/ChannelMapCache").default;
	presence: typeof import("./cache/PresenceCache").default;
	permOverwrite: typeof import("./cache/PermissionOverwriteCache").default;
	voiceState: typeof import("./cache/VoiceStateCache").default;
}

export interface RainCacheOptions {
	debug?: boolean;
	/**
	 * **Use this option if you want to use a different type of storage engine for certain caches**
	 *
	 * You may also combine options: e.g. a RedisStorageEngine for presence and the rest within mongo, that's no issue.
	 *
	 * The cache type specific storage engine takes priority over the default one.
	 */
	storage: {
		default: BaseStorageEngine<unknown>;
		guild?: BaseStorageEngine<import("discord-typings").Guild>;
		channel?: BaseStorageEngine<import("discord-typings").Channel>;
		member?: BaseStorageEngine<import("discord-typings").Member>;
		role?: BaseStorageEngine<import("discord-typings").Role>;
		user?: BaseStorageEngine<import("discord-typings").User>;
		emoji?: BaseStorageEngine<import("discord-typings").Emoji>;
		channelMap?: BaseStorageEngine<ChannelMap>;
		presence?: BaseStorageEngine<import("discord-typings").PresenceUpdate>;
		permOverwrite?: BaseStorageEngine<import("discord-typings").Overwrite>;
		voiceState?: BaseStorageEngine<import("discord-typings").VoiceState>;
	};
	/**
	 * If you want to disable events from being processed,
	 * you can add them here like this: `{'MESSAGE_CREATE':true}`,
	 * this would disable any MESSAGE_CREATEs from being cached
	 */
	disabledEvents?: {
		[K in import("discord-typings").GatewayEvent]?: boolean;
	};
	disabledCaches?: {
		[K in keyof CacheTypes]?: boolean;
	};
	/**
	 * object with classes (**not objects**) that should be used for each type of data that is cached
	 *
	 * **RainCache automatically uses default classes when no cache classes are passed, else it will use your classes.**
	 */
	cacheClasses?: {
		/** cache class to use for guilds, defaults to the GuildCache */
		guild?: typeof import("./cache/GuildCache").default;
		/** cache class to use for channels, defaults to ChannelCache */
		channel?: typeof import("./cache/ChannelCache").default;
		/** cache class to use for channels, defaults to ChannelMapCache */
		member?: typeof import("./cache/MemberCache").default;
		/** cache class to use for roles, defaults to RoleCache */
		role?: typeof import("./cache/RoleCache").default;
		/** cache class to use for users, defaults to UserCache */
		user?: typeof import("./cache/UserCache").default;
		/** cache class to use for emojis, defaults to EmojiCache */
		emoji?: typeof import("./cache/EmojiCache").default;
		/** cache class to use for channel relations, defaults to ChannelMapCache */
		channelMap?: typeof import("./cache/ChannelMapCache").default;
		/** cache class to use for presences, defaults to PresenceCache */
		presence?: typeof import("./cache/PresenceCache").default;
		/** cache class to use for permission overwrites, defaults to PermissionOverwriteCache */
		permOverwrite?: typeof import("./cache/PermissionOverwriteCache").default;
		/** cache class to use for voice states, defaults to VoiceStateCache */
		voiceState?: typeof import("./cache/VoiceStateCache").default;
	};
	structureDefs?: {
		guild?: StructureOptions<import("discord-typings").Guild>;
		channel?: StructureOptions<import("discord-typings").Channel>;
		member?: StructureOptions<import("discord-typings").Member>;
		role?: StructureOptions<import("discord-typings").Role>;
		user?: StructureOptions<import("discord-typings").User>;
		emoji?: StructureOptions<import("discord-typings").Emoji>;
		presence?: StructureOptions<import("discord-typings").PresenceUpdate>;
		permOverwrite?: StructureOptions<import("discord-typings").Overwrite>;
		voiceState?: StructureOptions<import("discord-typings").VoiceState>;
	}
}

export interface StructureOptions<T> {
	/** Deny all properties to be stored except for the ones specified here. Overrides blacklist entirely. */
	whitelist?: Array<keyof T>;
	/** Allow all properties to be stored except for the ones specified here. Is overrided by whitelist entirely. */
	blacklist?: Array<keyof T>;
}

export interface EventProcessorOptions {
	disabledEvents: {
		[event in import("discord-typings").GatewayEvent]?: boolean;
	};
	presenceInterval?: number;
	cache?: Caches;
}
