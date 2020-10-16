import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
declare class UserCache extends BaseCache<import("@amanda/discordtypings").UserData> {
    constructor(storageEngine: BaseStorageEngine<import("@amanda/discordtypings").UserData>, boundObject?: import("@amanda/discordtypings").UserData);
    get(id?: string): Promise<UserCache | null>;
    update(id: string, data: import("@amanda/discordtypings").UserData): Promise<UserCache>;
    remove(id?: string): Promise<void>;
    filter(fn: (user?: import("@amanda/discordtypings").UserData, index?: number, array?: Array<import("@amanda/discordtypings").UserData>) => unknown, ids?: Array<string>): Promise<Array<UserCache>>;
    find(fn: (user?: import("@amanda/discordtypings").UserData, index?: number, array?: Array<string>) => unknown, ids?: Array<string>): Promise<UserCache | null>;
    bindUserId(userId: string): UserCache;
    addToIndex(ids: Array<string>): Promise<void>;
    removeFromIndex(id: string): Promise<void>;
    isIndexed(id: string): Promise<boolean>;
    getIndexMembers(): Promise<Array<string>>;
    removeIndex(): Promise<void>;
    getIndexCount(): Promise<number>;
}
export = UserCache;
