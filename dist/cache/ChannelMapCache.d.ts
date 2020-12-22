import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
declare class ChannelMapCache extends BaseCache<import("../types").ChannelMap> {
    namespace: "channelmap";
    constructor(storageEngine: BaseStorageEngine<import("../types").ChannelMap>, rain: import("../RainCache")<any, any>, boundObject?: import("../types").ChannelMap);
    get(id: string, type?: "guild" | "user"): Promise<ChannelMapCache | null>;
    update(id: string, data: Array<string>, type?: "guild" | "user", remove?: boolean): Promise<ChannelMapCache>;
    remove(id: string, type?: "guild" | "user"): Promise<void>;
    private _removeOldChannels;
    private _checkDupes;
    private _buildMapId;
    private _buildMap;
}
export = ChannelMapCache;
