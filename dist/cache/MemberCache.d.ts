import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
declare class MemberCache extends BaseCache<import("@amanda/discordtypings").MemberData> {
    namespace: "member";
    user: import("./UserCache");
    constructor(storageEngine: BaseStorageEngine<import("@amanda/discordtypings").MemberData>, userCache: import("./UserCache"), rain: import("../RainCache")<any, any>, boundObject?: import("@amanda/discordtypings").MemberData);
    get(id: string, guildId?: string | undefined): Promise<MemberCache | null>;
    update(id: string, guildId: string | undefined, data: import("@amanda/discordtypings").MemberData): Promise<MemberCache>;
    remove(id: string, guildId?: string | undefined): Promise<void>;
    filter(fn: (member?: import("@amanda/discordtypings").MemberData, index?: number, array?: Array<import("@amanda/discordtypings").MemberData>) => unknown, guildId: string | undefined, ids: Array<string>): Promise<Array<MemberCache>>;
    find(fn: (member?: import("@amanda/discordtypings").MemberData, index?: number, array?: Array<string>) => boolean, guildId?: string | undefined, ids?: Array<string> | undefined): Promise<MemberCache | null>;
    buildId(userId: string, guildId?: string): string;
}
export = MemberCache;
