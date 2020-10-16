import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";
declare class PermissionOverwriteCache extends BaseCache<any> {
    boundChannel: string;
    namespace: "permissionoverwrite";
    constructor(storageEngine: BaseStorageEngine<any>, boundObject?: any);
    get(id: string, channelId?: string): Promise<PermissionOverwriteCache | null>;
    update(id: string, channelId: string, data: any): Promise<PermissionOverwriteCache>;
    remove(id: string, channelId?: string): Promise<void>;
    filter(fn: (overwrite?: any, index?: number, array?: Array<any>) => unknown, channelId?: string, ids?: Array<string>): Promise<Array<PermissionOverwriteCache>>;
    find(fn: (overwrite?: any, index?: any, array?: Array<string>) => unknown, channelId?: string, ids?: Array<string>): Promise<PermissionOverwriteCache>;
    buildId(permissionId: string, channelId?: string): string;
    bindChannel(channelId: string): PermissionOverwriteCache;
}
export = PermissionOverwriteCache;
