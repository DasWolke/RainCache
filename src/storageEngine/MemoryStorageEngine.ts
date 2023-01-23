import BaseStorageEngine from "./BaseStorageEngine";

/**
 * StorageEngine which uses a Map in the process memory space as a datasource
 */
class MemoryStorageEngine<T> extends BaseStorageEngine<T> {
	public map: Map<string, T> = new Map();
	public index: Map<string, Array<string>> = new Map();

	public initialize() { void 0; }

	/**
	 * Get an object from the cache via id
	 * @param id id of the object
	 */
	public get(id: string): T | null {
		return this.map.get(id) ?? null;
	}

	/**
	 * Upsert an object into the cache
	 * @param id id of the object
	 * @param updateData the new Data which get's merged with the old
	 */
	public upsert(id: string, updateData: Partial<T>): T | null {
		const data = this.get(id);
		const prepared = Object.assign(data || {}, updateData) as T;
		this.map.set(id, prepared);
		return data;
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
	public filter(fn: (value: T, index: number) => unknown, ids: Array<string> | null, namespace: string): Array<T> {
		const resolvedDataArray: Array<T> = [];
		let data: Array<string> = [];
		if (!ids) data = this.getListMembers(namespace);
		else data = ids;
		data = data.map(id => `${namespace}.${id}`);
		let index = 0;
		for (const key of data) {
			const resolvedData = this.get(key) as T;
			if (fn(resolvedData, index)) resolvedDataArray.push(resolvedData);
			index++;
		}
		return resolvedDataArray;
	}

	/**
	 * Filter for an object and return after the first search success
	 * @param fn filter function to use
	 * @param ids array of ids that should be used for the filtering
	 * @param namespace namespace of the filter
	 * @returns the first result or null if nothing was found
	 */
	public find(fn: (value: T, index: number) => boolean, ids: Array<string> | null = null, namespace: string): T | null {
		let data: Array<string> = [];
		if (!ids) data = this.getListMembers(namespace);
		else data = ids;
		data = data.map(id => `${namespace}.${id}`);
		let index = 0;
		for (const key of data) {
			const resolvedData = this.get(key) as T;
			if (fn(resolvedData, index)) return resolvedData;
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
	 * @param ids array of ids that should be added
	 */
	public addToList(listId: string, ids: Array<string>): void {
		const list = this.getListMembers(listId);
		for (const id of ids) {
			if (list.includes(id)) return;
			else list.push(id);
		}
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
	 * @param ids array of ids that should be removed
	 */
	public removeFromList(listId: string, ids: Array<string>): void {
		const list = this.getListMembers(listId);
		for (const id of ids) {
			const index = list.indexOf(id);
			if (index === -1) return;
			list.splice(index, 1);
		}
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
}

export default MemoryStorageEngine;
