declare class BaseCache<T> {
    storageEngine: import("../storageEngine/BaseStorageEngine")<T> | null;
    namespace: string;
    dataTimestamp?: Date;
    boundObject: T | null;
    boundGuild?: string;
    rain: import("../RainCache")<any, any>;
    constructor(rain: import("../RainCache")<any, any>);
    bindObject(boundObject: T): void;
    bindGuild(guildId: string): this;
    buildId(id: string): string;
    addToIndex(id: string, objectId?: string): Promise<void>;
    removeFromIndex(id: string, objectId?: string): Promise<void>;
    isIndexed(id: string, objectId?: string): Promise<boolean>;
    getIndexMembers(objectId?: string): Promise<Array<string>>;
    removeIndex(objectId?: string): Promise<void>;
    getIndexCount(objectId?: string): Promise<number>;
    structurize<T>(data: T): T;
}
export = BaseCache;
