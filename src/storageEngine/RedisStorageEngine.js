const BaseStorageEngine = require("./BaseStorageEngine");
const redis = require("redis");

/**
 * StorageEngine which uses redis as a datasource
 */
class RedisStorageEngine extends BaseStorageEngine {
	/**
	 * Create a new redis storage engine
	 * @param {Object} options
	 * @param {boolean} [options.useHash=false] - whether hash objects should be used for storing data
	 * @param {import("redis").ClientOpts} [options.redisOptions]
	 * @property {import("redis")} client - redis client
	 * @property {boolean} ready - whether this storage engine is ready for usage
	 * @property {boolean} useHash - whether hash objects should be used for storing data
	 * @property {Object} options - options that are passed to the redis client
	 */
	constructor(options = { useHash: false, redisOptions: { host: "localhost", port: 6379 } }) {
		super();
		this.client = null;
		this.ready = false;
		this.useHash = options.useHash;
		this.options = options;
	}

	/**
	 * Initialize the storage engine and create a connection to redis
	 * @returns {Promise<void>}
	 */
	initialize() {
		return new Promise((res) => {
			this.client = redis.createClient(this.options.redisOptions || undefined);
			this.client.once("ready", () => {
				this.ready = true;
				return res();
			});
		});

	}

	/**
	 * Get an object from the cache via id
	 * @param {string} id - id of the object
	 * @param {boolean} useHash - whether to use hash objects for this action
	 */
	get(id, useHash = this.useHash) {
		return new Promise((res, rej) => {
			if (useHash) {
				return this.client.HGETALL(id, res);
			} else {
				return this.client.GET(id, (err, data) => {
					if (err) return rej(err);
					res(this.parseData(data));
				});
			}
		});
	}

	/**
	 * Upsert an object into the cache
	 * @param {string} id - id of the object
	 * @param {Object} updateData - the new Data which get's merged with the old
	 * @param {boolean} useHash - whether to use hash objects for this action
	 * @returns {Promise<void>}
	 */
	upsert(id, updateData, useHash = this.useHash) {
		let data;
		return new Promise(async (res, rej) => {
			if (useHash) {
				this.client.HMSET(id, updateData, (err) => {
					if (err) void rej(err);
					else void res(undefined);
				});
			} else {
				data = await this.get(id).catch(rej);
				data = data || {};
				Object.assign(data, updateData);
				this.client.SET(id, this.prepareData(data), (err) => {
					if (err) void rej(err);
					else void res(undefined);
				});
			}
		});
	}

	/**
	 * Remove an object from the cache
	 * @param {string} id - id of the object
	 * @param {boolean} useHash - whether to use hash objects for this action
	 * @returns {Promise<void>}
	 */
	remove(id, useHash = this.useHash) {
		return new Promise((res, rej) => {
			if (useHash) {
				this.client.HKEYS(id, (err, hashKeys) => {
					if (err) void rej(err);
					this.client.HDEL(id, hashKeys, (e) => {
						if (e) void rej(e);
						else void res(undefined);
					});
				});
			} else {
				this.client.DEL(id, (err) => {
					if (err) void rej(err);
					else void res(undefined);
				});
			}
		});
	}

	/**
	 * Filter for an object
	 * @param {(value?: any, index?: number, array?: Array<any>) => any} fn - filter function to use
	 * @param {Array<string>} ids - array of ids that should be used for the filtering
	 * @param {string} namespace - namespace of the filter
	 * @returns {Promise<Array<Object|null>>} - filtered data
	 */
	async filter(fn, ids, namespace) {
		let resolvedDataArray = [];
		let data = [];
		if (!ids) {
			data = await this.getListMembers(namespace);
		} else {
			data = ids;
		}
		data = data.map(id => `${namespace}.${id}`);
		for (let key of data) {
			let resolvedData = await this.get(key);
			resolvedDataArray.push(resolvedData);
		}
		return resolvedDataArray.filter(fn);
	}

	/**
	 * Filter for an object and return after the first search success
	 * @param {Function} fn - filter function to use
	 * @param {Array<string>} ids - array of ids that should be used for the filtering
	 * @param {string} namespace - namespace of the filter
	 * @returns {Promise<Object|null>} - the first result or null if nothing was found
	 */
	async find(fn, ids = null, namespace) {
		let data = [];
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
		for (let key of data) {
			let resolvedData = await this.get(key);
			if (fn(resolvedData)) {
				return resolvedData;
			}
		}
	}

	/**
	 * Get a list of values that are part of a list
	 * @param {string} listId - id of the list
	 * @returns {Promise<Array<string>>} array of ids that are members of the list
	 */
	getListMembers(listId) {
		return new Promise((res, rej) => {
			this.client.SMEMBERS(listId, (err, data) => {
				if (err) return rej(err);
				else return res(data);
			});
		});
	}

	/**
	 * Add an id (or a list of them) to a list
	 * @param {string} listId - id of the list
	 * @param {Array<string>} ids - array of ids that should be added
	 * @returns {Promise<void>}
	 */
	addToList(listId, ids) {
		return new Promise((res, rej) => {
			this.client.SADD(listId, ids, (err) => {
				if (err) void rej(err);
				else void res(undefined);
			});
		});
	}

	/**
	 * Check if an id is part of a list
	 * @param {string} listId - id of the list
	 * @param {string} id - id that should be checked
	 * @returns {Promise<boolean>}
	 */
	isListMember(listId, id) {
		return new Promise((res, rej) => {
			this.client.SISMEMBER(listId, id, (err, resp) => {
				if (err) return rej(err);
				else return res(resp === 1);
			});
		});
	}

	/**
	 * Remove an id from a list
	 * @param {string} listId - id of the list
	 * @param {string} id - id that should be removed
	 * @returns {Promise<void>}
	 */
	removeFromList(listId, id) {
		return new Promise((res, rej) => {
			this.client.SREM(listId, id, (err) => {
				if (err) void rej(err);
				else void res(undefined);
			});
		});
	}

	/**
	 * Remove a list
	 * @param {string} listId - id of the list
	 */
	removeList(listId) {
		return this.remove(listId, false);
	}

	/**
	 * Get the amount of items within a list
	 * @param {string} listId - id of the list
	 * @returns {Promise<number>}
	 */
	getListCount(listId) {
		return new Promise((res, rej) => {
			this.client.SCARD(listId, (err, resp) => {
				if (err) return rej(err);
				else return res(resp);
			});
		});
	}

	/**
	 * Prepare data for storage inside redis
	 * @param data
	 */
	prepareData(data) {
		return JSON.stringify(data);
	}

	/**
	 * Parse loaded data
	 * @param data
	 * @returns {Object|null}
	 */
	parseData(data) {
		return data ? JSON.parse(data) : null;
	}

	/**
	 * Prepare a namespace for a KEYS operation by adding a * at the end
	 * @param {string} namespace - namespace to prepare
	 * @returns {string} namespace + *
	 */
	prepareNamespace(namespace) {
		return namespace.endsWith("*") ? namespace : namespace + "*";
	}
}

module.exports = RedisStorageEngine;
