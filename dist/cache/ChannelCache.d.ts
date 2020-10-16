import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
declare class ChannelCache extends BaseCache<import("../types").Channel> {
    channelMap: import("./ChannelMapCache");
    permissionOverwrites: import("./PermissionOverwriteCache");
    recipients: import("./UserCache");
    namespace: "channel";
    constructor(storageEngine: BaseStorageEngine<import("../types").Channel>, channelMap: import("./ChannelMapCache"), permissionOverwriteCache: import("./PermissionOverwriteCache"), userCache: import("./UserCache"), boundObject?: import("../types").Channel);
    get(id: string): Promise<ChannelCache | null>;
    update(id: string, data: import("../types").Channel): Promise<ChannelCache>;
    remove(id: string): Promise<void>;
    filter(fn: (channel?: import("../types").Channel, index?: number, array?: Array<import("../types").Channel>) => unknown, channelMap?: Array<string>): Promise<Array<ChannelCache>>;
    find(fn: (channel?: import("@amanda/discordtypings").ChannelData) => unknown, channelMap: Array<string>): Promise<ChannelCache | null>;
    addToIndex(ids: Array<string>): Promise<void>;
    removeFromIndex(id: string): Promise<void>;
    isIndexed(id: string): Promise<boolean>;
    getIndexMembers(): Promise<Array<string>>;
    removeIndex(): Promise<void>;
    getIndexCount(): Promise<number>;
}
export = ChannelCache;
