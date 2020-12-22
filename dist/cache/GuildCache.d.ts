import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
declare class GuildCache extends BaseCache<import("@amanda/discordtypings").GuildData> {
    channels: import("./ChannelCache");
    roles: import("./RoleCache");
    members: import("./MemberCache");
    emojis: import("./EmojiCache");
    presences: import("./PresenceCache");
    guildChannelMap: import("./ChannelMapCache");
    namespace: "guild";
    constructor(storageEngine: BaseStorageEngine<import("@amanda/discordtypings").GuildData>, channelCache: import("./ChannelCache"), roleCache: import("./RoleCache"), memberCache: import("./MemberCache"), emojiCache: import("./EmojiCache"), presenceCache: import("./PresenceCache"), guildToChannelCache: import("./ChannelMapCache"), rain: import("../RainCache")<any, any>, boundObject?: import("@amanda/discordtypings").GuildData);
    get(id: string): Promise<GuildCache | null>;
    update(id: string, data: import("@amanda/discordtypings").GuildData): Promise<GuildCache>;
    remove(id: string): Promise<void>;
    filter(fn: (emoji?: import("@amanda/discordtypings").GuildData, index?: number, array?: Array<import("@amanda/discordtypings").GuildData>) => unknown): Promise<Array<GuildCache>>;
    find(fn: (emoji?: import("@amanda/discordtypings").GuildData, index?: number, array?: Array<string>) => unknown): Promise<GuildCache | null>;
    addToIndex(id: string): Promise<void>;
    removeFromIndex(id: string): Promise<void>;
    isIndexed(id: string): Promise<boolean>;
    getIndexMembers(): Promise<Array<string>>;
    removeIndex(): Promise<void>;
    getIndexCount(): Promise<number>;
}
export = GuildCache;
