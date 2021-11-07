/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Base Storage engine class defining the methods being used by RainCache that a storage engine is supposed to have
 */
abstract class BaseStorageEngine<T> {
	public ready: boolean;

	public constructor() {
		this.ready = true;
	}

	/** Initializes the engine, e.g. db connection, etc.. */
	public initialize(): void | Promise<void> { void 0; }

	public get(id: string): T | null | Promise<T | null>;
	public get(id: string, useHash?: boolean): string | Promise<string>;
	public get(id: string, useHash?: boolean): T | string | null | Promise<T | string | null> { return null; }

	public upsert(id: string, data: Partial<T>): void | Promise<void> { void 0; }

	public remove(id: string, useHash?: boolean): void | Promise<void> { void 0; }

	public getListMembers(listId: string): Array<string> | Promise<Array<string>> { return ["null"]; }

	public addToList(listId: string, id: string): void | Promise<void> { void 0; }

	public isListMember(listId: string, id: string): boolean | Promise<boolean> { return false; }

	public removeFromList(listId: string, id: string): void | Promise<void> { void 0; }

	public removeList(listId: string): void | Promise<void> { void 0; }

	public getListCount(listId: string): number | Promise<number> { return 0; }

	public filter(fn: (value?: T, index?: number, array?: Array<T>) => unknown, ids?: Array<string>, namespace?: string): Array<T> | Promise<Array<T>> { return []; }

	public find(fn: (value?: T, index?: number, array?: Array<string>) => unknown, ids?: Array<string>, namespace?: string): T | null | Promise<T | null> { return null; }
}

export = BaseStorageEngine;
