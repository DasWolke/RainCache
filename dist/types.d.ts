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
    disabledEvents?: {
        [event: string]: boolean;
    };
    cacheClasses?: {
        guild?: any;
        channel?: any;
        member?: any;
        role?: any;
        user?: any;
        emoji?: any;
        channelMap?: any;
        presence?: any;
        permOverwrite?: any;
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
    whitelist?: Array<keyof T>;
    blacklist?: Array<keyof T>;
}
export interface RedisStorageOptions {
    useHash?: boolean;
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
