import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
declare class VoiceStateCache extends BaseCache<import("@amanda/discordtypings").VoiceStateData> {
    constructor(storageEngine: BaseStorageEngine<import("@amanda/discordtypings").VoiceStateData>, boundObject?: import("@amanda/discordtypings").VoiceStateData);
    get(id: string, guildId: string): Promise<VoiceStateCache | null>;
    update(id: string, guildId: string, data: import("@amanda/discordtypings").VoiceStateData): Promise<VoiceStateCache>;
    remove(id: string, guildId: string): Promise<void>;
    filter(fn: (state?: import("@amanda/discordtypings").VoiceStateData, index?: number, array?: Array<import("@amanda/discordtypings").VoiceStateData>) => unknown, ids?: Array<string>): Promise<Array<VoiceStateCache>>;
    find(fn: (state?: import("@amanda/discordtypings").VoiceStateData, index?: number, array?: Array<string>) => unknown, ids?: Array<string>): Promise<VoiceStateCache | null>;
    bindUserId(userId: string): VoiceStateCache;
    removeFromIndex(id: string, guildId?: string): Promise<void>;
    isIndexed(id: string, guildId?: string): Promise<boolean>;
    getIndexMembers(): Promise<Array<string>>;
    removeIndex(): Promise<void>;
    getIndexCount(): Promise<number>;
    buildId(userId: string, guildId?: string): string;
}
export = VoiceStateCache;
