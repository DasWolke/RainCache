import BaseStorageEngine from "./BaseStorageEngine";
declare class MemoryStorageEngine<T> extends BaseStorageEngine<T> {
    map: Map<string, string>;
    index: Map<string, Array<string>>;
    constructor();
    get(id: string): T | null;
    upsert(id: string, updateData: T): void;
    remove(id: string): void;
    filter(fn: (value?: T, index?: number, array?: Array<T>) => unknown, ids: Array<string>, namespace: string): Array<T>;
    find(fn: (value?: T, index?: number, array?: Array<string>) => boolean, ids: string[] | null | undefined, namespace: string): T | null;
    getListMembers(listId: string): Array<string>;
    addToList(listId: string, id: string): void;
    isListMember(listId: string, id: string): boolean;
    removeFromList(listId: string, id: string): void;
    removeList(listId: string): void;
    getListCount(listId: string): number;
    private prepareData;
    private parseData;
}
export = MemoryStorageEngine;
