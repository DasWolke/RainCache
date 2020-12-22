import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
declare class PresenceCache extends BaseCache<import("@amanda/discordtypings").PresenceData> {
    namespace: "presence";
    users: import("./UserCache");
    constructor(storageEngine: BaseStorageEngine<import("@amanda/discordtypings").PresenceData>, userCache: import("./UserCache"), rain: import("../RainCache")<any, any>, boundObject?: import("@amanda/discordtypings").PresenceData);
    get(id: string): Promise<PresenceCache | null>;
    update(id: string, data: import("@amanda/discordtypings").PresenceData): Promise<PresenceCache>;
    remove(id: string): Promise<void>;
}
export = PresenceCache;
