import BaseStorageEngine from "./BaseStorageEngine";
declare class RedisStorageEngine<T> extends BaseStorageEngine<T> {
    client: import("redis").RedisClient | null;
    useHash: boolean;
    options: import("../types").RedisStorageOptions;
    constructor(options?: import("../types").RedisStorageOptions);
    initialize(): Promise<void>;
    get(id: string): Promise<T | null>;
    get(id: string, useHash: boolean): Promise<string>;
    upsert(id: string, updateData: any, useHash?: boolean): Promise<void>;
    remove(id: string, useHash?: boolean): Promise<void>;
    filter(fn: (value?: T, index?: number, array?: Array<T>) => unknown, ids: Array<string>, namespace: string): Promise<Array<any>>;
    find(fn: (value?: T, index?: number, array?: Array<string>) => boolean, ids: Array<string> | null, namespace: string): Promise<T | null>;
    getListMembers(listId: string): Promise<Array<string>>;
    addToList(listId: string, ids: Array<string>): Promise<void>;
    isListMember(listId: string, id: string): Promise<boolean>;
    removeFromList(listId: string, id: string): Promise<void>;
    removeList(listId: string): Promise<void>;
    getListCount(listId: string): Promise<number>;
    prepareData(data: T): string;
    parseData(data: string | null): T | null;
    prepareNamespace(namespace: string): string;
}
export = RedisStorageEngine;
