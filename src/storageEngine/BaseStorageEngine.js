// @ts-nocheck
/* eslint-disable no-unused-vars */

/**
 * Base Storage engine class defining the methods being used by RainCache that a storage engine is supposed to have
 */
class BaseStorageEngine {
	constructor() {
		this.ready = true;
	}

	initialize() {
		// Initializes the engine, e.g. db connection, etc..
	}
	/**
	 * @returns {Promise<any>}
	 */
	get(id) {}
	upsert(id, data) {}
	remove(id, useHash) {}
	/**
	 * @returns {Promise<Array<string>>}
	 */
	getListMembers(listId) {}
	addToList(listId, ids) {}
	/**
	 * @returns {Promise<boolean>}
	 */
	isListMember(listId, id) {}
	removeFromList(listId, id) {}
	removeList(listId) {}
	/**
	 * @returns {Promise<number>}
	 */
	getListCount(listId) {}
	/**
	 * @returns {Promise<Array<any>>}
	 */
	filter(fn, ids, namespace) {}
	/**
	 * @returns {Promise<any>}
	 */
	find(fn, ids = null, namespace) {}
}

module.exports = BaseStorageEngine;
