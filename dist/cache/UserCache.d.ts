import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
declare class UserCache extends BaseCache<import("@amanda/discordtypings").UserData> {
    constructor(storageEngine: BaseStorageEngine<import("@amanda/discordtypings").UserData>, rain: import("../RainCache")<any, any>, boundObject?: import("@amanda/discordtypings").UserData);
    get(id?: string | undefined): Promise<UserCache | null>;
    update(id: string | undefined, data: import("@amanda/discordtypings").UserData): Promise<UserCache>;
    remove(id?: string | undefined): Promise<void>;
    filter(fn: (user?: import("@amanda/discordtypings").UserData, index?: number, array?: Array<import("@amanda/discordtypings").UserData>) => unknown, ids?: Array<string> | undefined): Promise<Array<UserCache>>;
    find(fn: (user?: import("@amanda/discordtypings").UserData, index?: number, array?: Array<string>) => unknown, ids?: Array<string> | undefined): Promise<UserCache | null>;
    bindUserId(userId: string): UserCache;
    addToIndex(id: string): Promise<void>;
    removeFromIndex(id: string): Promise<void>;
    isIndexed(id: string): Promise<boolean>;
    getIndexMembers(): Promise<Array<string>>;
    removeIndex(): Promise<void>;
    getIndexCount(): Promise<number>;
}
export = UserCache;
