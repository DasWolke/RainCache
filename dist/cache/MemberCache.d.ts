import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
declare class MemberCache extends BaseCache<import("@amanda/discordtypings").MemberData> {
    namespace: "member";
    user: import("./UserCache");
    constructor(storageEngine: BaseStorageEngine<import("@amanda/discordtypings").MemberData>, userCache: import("./UserCache"), boundObject?: import("@amanda/discordtypings").MemberData);
    get(id: string, guildId?: string): Promise<MemberCache | null>;
    update(id: string, guildId: string, data: import("@amanda/discordtypings").MemberData): Promise<MemberCache>;
    remove(id: string, guildId?: string): Promise<void>;
    filter(fn: (member?: import("@amanda/discordtypings").MemberData, index?: number, array?: Array<import("@amanda/discordtypings").MemberData>) => unknown, guildId?: string, ids?: Array<string>): Promise<Array<MemberCache>>;
    find(fn: (member?: import("@amanda/discordtypings").MemberData, index?: number, array?: Array<string>) => boolean, guildId?: string, ids?: any): Promise<MemberCache | null>;
    buildId(userId: string, guildId?: string): string;
}
export = MemberCache;
