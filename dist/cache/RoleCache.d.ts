import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
declare class RoleCache extends BaseCache<import("@amanda/discordtypings").RoleData> {
    namespace: "role";
    constructor(storageEngine: BaseStorageEngine<import("@amanda/discordtypings").RoleData>, boundObject?: import("@amanda/discordtypings").RoleData);
    get(id: string, guildId: string): Promise<RoleCache | null>;
    update(id: string, guildId: string, data: import("@amanda/discordtypings").RoleData): Promise<RoleCache>;
    remove(id: string, guildId: string): Promise<void>;
    filter(fn: (role?: import("@amanda/discordtypings").RoleData, index?: number, array?: Array<import("@amanda/discordtypings").RoleData>) => unknown, guildId?: string | undefined, ids?: Array<string> | undefined): Promise<Array<RoleCache>>;
    find(fn: (role?: import("@amanda/discordtypings").RoleData, index?: number, array?: Array<string>) => unknown, guildId?: string | undefined, ids?: Array<string> | undefined): Promise<RoleCache | null>;
    buildId(roleId: string, guildId?: string): string;
}
export = RoleCache;
