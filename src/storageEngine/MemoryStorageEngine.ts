import BaseStorageEngine from "./BaseStorageEngine";

/**
 * StorageEngine which uses a Map in the process memory space as a datasource
 */
class MemoryStorageEngine<T> extends BaseStorageEngine<T> {
	public map: Map<string, string> = new Map();
	public index: Map<string, Array<string>> = new Map();

	public constructor() {
		super();
	}

	/**
	 * Get an object from the cache via id
	 * @param id id of the object
	 */
	// @ts-ignore
	public get(id: string): T | null {
		const raw = this.map.get(id);
		return this.parseData(raw);
	}

	/**
	 * Upsert an object into the cache
	 * @param id id of the object
	 * @param updateData the new Data which get's merged with the old
	 */
	public upsert(id: string, updateData: T): void {
		const data = this.get(id);
		const newData = data || {};
		Object.assign(newData, updateData);
		const prepared = this.prepareData(newData as T);
		this.map.set(id, prepared);
	}

	/**
	 * Remove an object from the cache
	 * @param id id of the object
	 */
	public remove(id: string): void {
		this.map.delete(id);
	}

	/**
	 * Filter for an object
	 * @param fn filter function to use
	 * @param ids array of ids that should be used for the filtering
	 * @param namespace namespace of the filter
	 * @returns filtered data
	 */
	public filter(fn: (value?: T, index?: number, array?: Array<T>) => unknown, ids: Array<string>, namespace: string): Array<T> {
		const resolvedDataArray: Array<T> = [];
		let data: Array<string> = [];
		if (!ids) {
			data = this.getListMembers(namespace);
		} else {
			data = ids;
		}
		data = data.map(id => `${namespace}.${id}`);
		for (const key of data) {
			const resolvedData = this.get(key);
			if (resolvedData) resolvedDataArray.push(resolvedData);
		}
		return resolvedDataArray.filter(fn);
	}

	/**
	 * Filter for an object and return after the first search success
	 * @param fn filter function to use
	 * @param ids array of ids that should be used for the filtering
	 * @param namespace namespace of the filter
	 * @returns the first result or null if nothing was found
	 */
	public find(fn: (value?: T, index?: number, array?: Array<string>) => boolean, ids: Array<string> | null = null, namespace: string): T | null {
		let data: Array<string> = [];
		if (typeof ids === "string" && !namespace) {
			namespace = ids;
			ids = null;
		}
		if (!ids) {
			data = this.getListMembers(namespace);
		} else {
			data = ids;
		}
		data = data.map(id => `${namespace}.${id}`);
		let index = 0;
		for (const key of data) {
			const resolvedData = this.get(key);
			if (resolvedData && fn(resolvedData, index, data)) {
				return resolvedData;
			}
			index++;
		}
		return null;
	}

	/**
	 * Get a list of values that are part of a list
	 * @param listId id of the list
	 * @returns array of ids that are members of the list
	 */
	public getListMembers(listId: string): Array<string> {
		return this.index.get(listId) || [];
	}

	/**
	 * Add an id (or a list of them) to a list
	 * @param listId id of the list
	 * @param id array of ids that should be added
	 */
	public addToList(listId: string, id: string): void {
		const list = this.getListMembers(listId);
		if (list.includes(id)) return;
		else list.push(id);
		const listExists = !!this.index.get(listId);
		if (!listExists) this.index.set(listId, list);
	}

	/**
	 * Check if an id is part of a list
	 * @param listId id of the list
	 * @param id id that should be checked
	 */
	public isListMember(listId: string, id: string): boolean {
		return this.getListMembers(listId).includes(id);
	}

	/**
	 * Remove an id from a list
	 * @param listId id of the list
	 * @param id id that should be removed
	 */
	public removeFromList(listId: string, id: string): void {
		const list = this.getListMembers(listId);
		const index = list.indexOf(id);
		if (index === -1) return;
		list.splice(index, 1);
	}

	/**
	 * Remove a list
	 * @param listId id of the list
	 */
	public removeList(listId: string): void {
		this.index.delete(listId);
	}

	/**
	 * Get the amount of items within a list
	 * @param listId id of the list
	 */
	public getListCount(listId: string): number {
		return this.getListMembers(listId).length;
	}

	/**
	 * Prepare data for storage inside redis
	 */
	private prepareData(data: T): string {
		return JSON.stringify(data);
	}

	/**
	 * Parse loaded data
	 */
	private parseData(data: string | null | undefined): T | null {
		return data ? JSON.parse(data) : null;
	}
}

export = MemoryStorageEngine;
