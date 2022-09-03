/**
 * Base Storage engine class defining the methods being used by RainCache that a storage engine is supposed to have
 */
abstract class BaseStorageEngine<T> {
	public ready = false;

	/**
	 * Initializes the engine, e.g. db connection, etc..
	 */
	public abstract initialize(): unknown;

	public abstract get(id: string): (T | null) | Promise<(T | null)>;

	public abstract upsert(id: string, data: Partial<T>): (T | null) | Promise<(T | null)>;

	public abstract remove(id: string): unknown;

	public abstract getListMembers(listId: string): Array<string> | Promise<Array<string>>;

	public abstract addToList(listId: string, ids: Array<string>): unknown;

	public abstract isListMember(listId: string, id: string): boolean | Promise<boolean>;

	public abstract removeFromList(listId: string, ids: Array<string>): unknown;

	public abstract removeList(listId: string): unknown;

	public abstract getListCount(listId: string): number | Promise<number>;

	public abstract filter(fn: (value: T, index: number) => boolean, ids: Array<string> | null, namespace: string): Array<T> | Promise<Array<T>>;

	public abstract find(fn: (value: T, index: number) => boolean, ids: Array<string> | null, namespace: string): (T | null) | Promise<(T | null)>;
}

export default BaseStorageEngine;
