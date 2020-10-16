declare class BaseStorageEngine<T> {
    ready: boolean;
    constructor();
    initialize(): void | Promise<void>;
    get(id: string): T | null | Promise<T | null>;
    get(id: string, useHash?: boolean): string | Promise<string>;
    upsert(id: string, data: T): void | Promise<void>;
    remove(id: string, useHash?: boolean): void | Promise<void>;
    getListMembers(listId: string): Array<string> | Promise<Array<string>>;
    addToList(listId: string, ids: Array<string>): void | Promise<void>;
    isListMember(listId: string, id: string): boolean | Promise<boolean>;
    removeFromList(listId: string, id: string): void | Promise<void>;
    removeList(listId: string): void | Promise<void>;
    getListCount(listId: string): number | Promise<number>;
    filter(fn: (value?: T, index?: number, array?: Array<T>) => unknown, ids?: Array<string>, namespace?: string): Array<T> | Promise<Array<T>>;
    find(fn: (value?: T, index?: number, array?: Array<any>) => unknown, ids?: Array<string>, namespace?: string): T | null | Promise<T | null>;
}
export = BaseStorageEngine;
