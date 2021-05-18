import BaseStorageEngine from "./storageEngine/BaseStorageEngine";
export interface Caches {
    guild: import("./cache/GuildCache");
    channel: import("./cache/ChannelCache");
    member: import("./cache/MemberCache");
    role: import("./cache/RoleCache");
    user: import("./cache/UserCache");
    emoji: import("./cache/EmojiCache");
    channelMap: import("./cache/ChannelMapCache");
    presence: import("./cache/PresenceCache");
    permOverwrite: import("./cache/PermissionOverwriteCache");
    voiceState: import("./cache/VoiceStateCache");
}
export interface CacheTypes {
    guild: typeof import("./cache/GuildCache");
    channel: typeof import("./cache/ChannelCache");
    member: typeof import("./cache/MemberCache");
    role: typeof import("./cache/RoleCache");
    user: typeof import("./cache/UserCache");
    emoji: typeof import("./cache/EmojiCache");
    channelMap: typeof import("./cache/ChannelMapCache");
    presence: typeof import("./cache/PresenceCache");
    permOverwrite: typeof import("./cache/PermissionOverwriteCache");
    voiceState: typeof import("./cache/VoiceStateCache");
}
export interface RainCacheOptions {
    debug?: boolean;
    /**
     * **Use this option if you do not want to use a different type of storage engine for certain caches**
     *
     * You may also combine options: e.g. a RedisStorageEngine for presence and the rest within mongo, that's no issue.
     *
     * The cache type specific storage engine takes priority over the default one.
     */
    storage: {
        default: BaseStorageEngine<any>;
        guild?: RainCacheOptions["storage"]["default"];
        channel?: RainCacheOptions["storage"]["default"];
        member?: RainCacheOptions["storage"]["default"];
        role?: RainCacheOptions["storage"]["default"];
        user?: RainCacheOptions["storage"]["default"];
        emoji?: RainCacheOptions["storage"]["default"];
        channelMap?: RainCacheOptions["storage"]["default"];
        presence?: RainCacheOptions["storage"]["default"];
        permOverwrite?: RainCacheOptions["storage"]["default"];
        voiceState?: RainCacheOptions["storage"]["default"];
    };
    /**
     * If you want to disable events from being processed,
     * you can add them here like this: `{'MESSAGE_CREATE':true}`,
     * this would disable any MESSAGE_CREATEs from being cached
     */
    disabledEvents?: {
        [event: string]: boolean;
    };
    /**
     * object with classes (**not objects**) that should be used for each type of data that is cached
     *
     * **RainCache automatically uses default classes when no cache classes are passed, else it will use your classes.**
     */
    cacheClasses?: {
        /** cache class to use for guilds, defaults to the GuildCache */
        guild?: any;
        /** cache class to use for channels, defaults to ChannelCache */
        channel?: any;
        /** cache class to use for channels, defaults to ChannelMapCache */
        member?: any;
        /** cache class to use for roles, defaults to RoleCache */
        role?: any;
        /** cache class to use for users, defaults to UserCache */
        user?: any;
        /** cache class to use for emojis, defaults to EmojiCache */
        emoji?: any;
        /** cache class to use for channel relations, defaults to ChannelMapCache */
        channelMap?: any;
        /** cache class to use for presences, defaults to PresenceCache */
        presence?: any;
        /** cache class to use for permission overwrites, defaults to PermissionOverwriteCache */
        permOverwrite?: any;
        /** cache class to use for voice states, defaults to VoiceStateCache */
        voiceState?: any;
    };
    structureDefs?: {
        guild?: StructureOptions<import("@amanda/discordtypings").GuildData>;
        channel?: StructureOptions<import("@amanda/discordtypings").ChannelData>;
        member?: StructureOptions<import("@amanda/discordtypings").MemberData>;
        role?: StructureOptions<import("@amanda/discordtypings").RoleData>;
        user?: StructureOptions<import("@amanda/discordtypings").UserData>;
        emoji?: StructureOptions<import("@amanda/discordtypings").EmojiData>;
        presence?: StructureOptions<import("@amanda/discordtypings").PresenceData>;
        permOverwrite?: StructureOptions<import("@amanda/discordtypings").PermissionOverwriteData>;
        voiceState?: StructureOptions<import("@amanda/discordtypings").VoiceStateData>;
    };
}
export interface StructureOptions<T> {
    /** Deny all properties to be stored except for the ones specified here. Overrides blacklist entirely. */
    whitelist?: Array<keyof T>;
    /** Allow all properties to be stored except for the ones specified here. Is overrided by whitelist entirely. */
    blacklist?: Array<keyof T>;
}
export interface RedisStorageOptions {
    /** whether hash objects should be used for storing data */
    useHash?: boolean;
    /** options that are passed to the redis client */
    redisOptions?: import("redis").ClientOpts;
}
export interface EventProcessorOptions {
    disabledEvents: {
        [event: string]: boolean;
    };
    presenceInterval?: number;
    cache?: Caches;
}
export declare type Channel = import("@amanda/discordtypings").ChannelData & {
    guild_id?: string;
    recipients?: Array<import("@amanda/discordtypings").UserData>;
    permission_overwrites?: Array<{
        id: string;
    }>;
};
export declare type ChannelMap = {
    id: string;
    type: "guild" | "user";
    channels: Array<string>;
};
export interface DiscordPacket {
    t: string;
    d: any;
    s?: number;
}
