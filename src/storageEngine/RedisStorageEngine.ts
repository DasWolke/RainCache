/* eslint-disable no-async-promise-executor */

import BaseStorageEngine from "./BaseStorageEngine";
import redis from "redis";

/**
 * StorageEngine which uses redis as a datasource
 */
class RedisStorageEngine<T> extends BaseStorageEngine<T> {
	/** whether this storage engine is ready for usage */
	public client: import("redis").RedisClient | null;
	/** whether hash objects should be used for storing data */
	public useHash: boolean;
	/** options that are passed to the redis client */
	public options: import("../types").RedisStorageOptions;

	/**
	 * Create a new redis storage engine
	 */
	public constructor(options: import("../types").RedisStorageOptions = { useHash: false, redisOptions: { host: "localhost", port: 6379 } }) {
		super();
		this.client = null;
		this.ready = false;
		this.useHash = options.useHash || false;
		this.options = options;
	}

	/**
	 * Initialize the storage engine and create a connection to redis
	 */
	public initialize(): Promise<void> {
		return new Promise((res) => {
			this.client = redis.createClient(this.options.redisOptions || undefined);
			this.client.once("ready", () => {
				this.ready = true;
				return res(undefined);
			});
		});
	}

	/**
	 * Get an object from the cache via id
	 * @param id id of the object
	 */
	public get(id: string): Promise<T | null>
	/**
	 * Get an object from the cache via id
	 * @param id id of the object
	 * @param useHash whether to use hash objects for this action
	 */
	public get(id: string, useHash: boolean): Promise<string>
	/**
	 * Get an object from the cache via id
	 * @param id id of the object
	 * @param useHash whether to use hash objects for this action
	 */
	public get(id: string, useHash: boolean = this.useHash): any {
		return new Promise((res, rej) => {
			if (useHash) {
				// @ts-ignore
				return this.client?.HGETALL(id, (err, data: T) => {
					if (err) rej(err);
					else res(this.prepareData(data));
				});
			} else {
				return this.client?.GET(id, (err, data) => {
					if (err) return rej(err);
					else res(this.parseData(data));
				});
			}
		});
	}

	/**
	 * Upsert an object into the cache
	 * @param id id of the object
	 * @param updateData the new Data which get's merged with the old
	 * @param useHash whether to use hash objects for this action
	 */
	public upsert(id: string, updateData: any, useHash: boolean = this.useHash): Promise<void> {
		let data: any | null;
		return new Promise(async (res, rej) => {
			if (useHash) {
				this.client?.HMSET(id, updateData, (err) => {
					if (err) void rej(err);
					else void res(undefined);
				});
			} else {
				try {
					data = await this.get(id);
				} catch (e) {
					rej(e);
				}
				data = data || {};
				Object.assign(data, updateData);
				this.client?.SET(id, this.prepareData(data), (err) => {
					if (err) void rej(err);
					else void res(undefined);
				});
			}
		});
	}

	/**
	 * Remove an object from the cache
	 * @param id id of the object
	 * @param useHash whether to use hash objects for this action
	 */
	public remove(id: string, useHash: boolean = this.useHash): Promise<void> {
		return new Promise((res, rej) => {
			if (useHash) {
				this.client?.HKEYS(id, (err, hashKeys) => {
					if (err) void rej(err);
					this.client?.HDEL(id, hashKeys, (e) => {
						if (e) void rej(e);
						else void res(undefined);
					});
				});
			} else {
				this.client?.DEL(id, (err) => {
					if (err) void rej(err);
					else void res(undefined);
				});
			}
		});
	}

	/**
	 * Filter for an object
	 * @param fn filter function to use
	 * @param ids array of ids that should be used for the filtering
	 * @param namespace namespace of the filter
	 * @returns filtered data
	 */
	public async filter(fn: (value?: T, index?: number, array?: Array<T>) => unknown, ids: Array<string>, namespace: string): Promise<Array<any>> {
		const resolvedDataArray: Array<T> = [];
		let data: Array<string> = [];
		if (!ids) {
			data = await this.getListMembers(namespace);
		} else {
			data = ids;
		}
		data = data.map(id => `${namespace}.${id}`);
		for (const key of data) {
			const resolvedData = await this.get(key);
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
	public async find(fn: (value?: T, index?: number, array?: Array<string>) => boolean, ids: Array<string> | null = null, namespace: string): Promise<T | null> {
		let data: Array<string> = [];
		if (typeof ids === "string" && !namespace) {
			namespace = ids;
			ids = null;
		}
		if (!ids) {
			data = await this.getListMembers(namespace);
		} else {
			data = ids;
		}
		data = data.map(id => `${namespace}.${id}`);
		let index = 0;
		for (const key of data) {
			const resolvedData = await this.get(key);
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
	public getListMembers(listId: string): Promise<Array<string>> {
		return new Promise((res, rej) => {
			this.client?.SMEMBERS(listId, (err, data) => {
				if (err) return rej(err);
				else return res(data);
			});
		});
	}

	/**
	 * Add an id (or a list of them) to a list
	 * @param listId id of the list
	 * @param id array of ids that should be added
	 */
	public addToList(listId: string, id: string): Promise<void> {
		return new Promise((res, rej) => {
			this.client?.SADD(listId, id, (err) => {
				if (err) void rej(err);
				else void res(undefined);
			});
		});
	}

	/**
	 * Check if an id is part of a list
	 * @param listId id of the list
	 * @param id id that should be checked
	 */
	public isListMember(listId: string, id: string): Promise<boolean> {
		return new Promise((res, rej) => {
			this.client?.SISMEMBER(listId, id, (err, resp) => {
				if (err) return rej(err);
				else return res(resp === 1);
			});
		});
	}

	/**
	 * Remove an id from a list
	 * @param listId id of the list
	 * @param id id that should be removed
	 */
	public removeFromList(listId: string, id: string): Promise<void> {
		return new Promise((res, rej) => {
			this.client?.SREM(listId, id, (err) => {
				if (err) void rej(err);
				else void res(undefined);
			});
		});
	}

	/**
	 * Remove a list
	 * @param listId id of the list
	 */
	public removeList(listId: string) {
		return this.remove(listId, false);
	}

	/**
	 * Get the amount of items within a list
	 * @param listId id of the list
	 */
	public getListCount(listId: string): Promise<number> {
		return new Promise((res, rej) => {
			this.client?.SCARD(listId, (err, resp) => {
				if (err) return rej(err);
				else return res(resp);
			});
		});
	}

	/**
	 * Prepare data for storage inside redis
	 */
	public prepareData(data: T) {
		return JSON.stringify(data);
	}

	/**
	 * Parse loaded data
	 */
	public parseData(data: string | null): T | null {
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

export = RedisStorageEngine;
