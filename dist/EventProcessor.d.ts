/// <reference types="node" />
import { EventEmitter } from "events";
declare class EventProcessor extends EventEmitter {
    options: import("./types").EventProcessorOptions;
    guildCache?: import("./cache/GuildCache");
    channelCache?: import("./cache/ChannelCache");
    memberCache?: import("./cache/MemberCache");
    roleCache?: import("./cache/RoleCache");
    userCache?: import("./cache/UserCache");
    emojiCache?: import("./cache/EmojiCache");
    channelMapCache?: import("./cache/ChannelMapCache");
    presenceCache?: import("./cache/PresenceCache");
    permOverwriteCache?: import("./cache/PermissionOverwriteCache");
    voiceStateCache?: import("./cache/VoiceStateCache");
    ready: boolean;
    presenceQueue: any;
    presenceFlush: NodeJS.Timeout;
    constructor(options?: import("./types").EventProcessorOptions);
    inbound(event: import("./types").DiscordPacket): Promise<import("./types").DiscordPacket>;
    private process;
    private handlePresenceUpdate;
    private processReady;
    private onChannelCreate;
    private onChannelDelete;
    private flushQueue;
}
export = EventProcessor;
