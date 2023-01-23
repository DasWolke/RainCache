/* eslint-disable no-async-promise-executor */

import BaseStorageEngine from "./BaseStorageEngine";
import redis from "redis";

/**
 * StorageEngine which uses redis as a datasource
 */
class RedisStorageEngine<T> extends BaseStorageEngine<T> {
	/** whether this storage engine is ready for usage */
	public client: ReturnType<typeof import("redis")["createClient"]> | null = null;
	/** options that are passed to the redis client */
	public options: Parameters<typeof import("redis")["createClient"]>["0"];

	/**
	 * Create a new redis storage engine
	 */
	public constructor(options: Parameters<typeof import("redis")["createClient"]>["0"]) {
		super();
		this.options = options;
	}

	/**
	 * Initialize the storage engine and create a connection to redis
	 */
	public initialize(): Promise<void> {
		return new Promise((res) => {
			this.client = redis.createClient(this.options);
			this.client.once("ready", () => {
				this.ready = true;
				return res(void 0);
			});
		});
	}

	/**
	 * Get an object from the cache via id
	 * @param id id of the object
	 */
	public async get(id: string): Promise<T | null> {
		const data = await this.client?.GET(id);
		return this.parseData(data);
	}

	/**
	 * Upsert an object into the cache
	 * @param id id of the object
	 * @param updateData the new Data which get's merged with the old
	 */
	public async upsert(id: string, updateData: Partial<T>): Promise<T | null> {
		const data = await this.get(id);
		await this.client?.SET(id, this.prepareData(Object.assign({}, data || {}, updateData)));
		return data;
	}

	/**
	 * Remove an object from the cache
	 * @param id id of the object
	 */
	public async remove(id: string): Promise<void> {
		await this.client?.DEL(id);
	}

	/**
	 * Filter for an object
	 * @param fn filter function to use
	 * @param ids array of ids that should be used for the filtering
	 * @param namespace namespace of the filter
	 * @returns filtered data
	 */
	public async filter(fn: (value: T, index: number) => boolean, ids: Array<string> | null, namespace: string): Promise<Array<T>> {
		const resolvedDataArray: Array<T> = [];
		let data: Array<string>;
		if (!ids) data = await this.getListMembers(namespace);
		else data = ids;
		data = data.map(id => `${namespace}.${id}`);
		let index = 0;
		for (const key of data) {
			const resolvedData = await this.get(key);
			if (!resolvedData) continue;
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
	public async find(fn: (value: T, index: number) => boolean, ids: Array<string> | null = null, namespace: string): Promise<T | null> {
		let data: Array<string> = [];
		if (!ids) data = await this.getListMembers(namespace);
		else data = ids;
		data = data.map(id => `${namespace}.${id}`);
		let index = 0;
		for (const key of data) {
			const resolvedData = await this.get(key);
			if (!resolvedData) continue;
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
	public async getListMembers(listId: string): Promise<Array<string>> {
		const d = await this.client?.SMEMBERS(listId);
		return d || [];
	}

	/**
	 * Add an id (or a list of them) to a list
	 * @param listId id of the list
	 * @param ids array of ids that should be added
	 */
	public async addToList(listId: string, ids: Array<string>): Promise<void> {
		await this.client?.SADD(listId, ids);
	}

	/**
	 * Check if an id is part of a list
	 * @param listId id of the list
	 * @param id id that should be checked
	 */
	public async isListMember(listId: string, id: string): Promise<boolean> {
		const is = this.client?.SISMEMBER(listId, id);
		return !!is;
	}

	/**
	 * Remove an id from a list
	 * @param listId id of the list
	 * @param ids array of ids that should be removed
	 */
	public async removeFromList(listId: string, ids: Array<string>): Promise<void> {
		await this.client?.SREM(listId, ids);
	}

	/**
	 * Remove a list
	 * @param listId id of the list
	 */
	public removeList(listId: string) {
		return this.remove(listId);
	}

	/**
	 * Get the amount of items within a list
	 * @param listId id of the list
	 */
	public async getListCount(listId: string): Promise<number> {
		const count = await this.client?.SCARD(listId);
		return count || 0;
	}

	/**
	 * Prepare data for storage inside redis
	 */
	public prepareData(data: Partial<T>) {
		return JSON.stringify(data);
	}

	/**
	 * Parse loaded data
	 */
	public parseData(data: string | null | undefined): T | null {
		return data ? JSON.parse(data) : null;
	}

	/**
	 * Prepare a namespace for a KEYS operation by adding a * at the end
	 * @param namespace namespace to prepare
	 * @returns namespace + *
	 */
	public prepareNamespace(namespace: string): string {
		return namespace.endsWith("*") ? namespace : namespace + "*";
	}
}

export default RedisStorageEngine;
