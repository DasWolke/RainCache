import BaseStorageEngine from "../storageEngine/BaseStorageEngine";

abstract class BaseCache<T> {
	public storageEngine: BaseStorageEngine<T>;
	public namespace = "base";
	public dataTimestamp: Date | null = null;
	public boundObject: Partial<T> | null = null;
	public oldObject: Partial<T> | null = null;
	/** guild id bound to this cache */
	public boundGuild?: string;
	public rain: import("../RainCache").default<any, any>;

	/**
	 * Base class for all cache classes.
	 *
	 * You should **not** create BaseCache by itself, but instead create a class that extends from it.
	 *
	 * **All Methods from BaseCache are also available on every class that is extending it.**
	 */
	public constructor(storageEngine: BaseStorageEngine<T>, rain: import("../RainCache").default<any, any>) {
		this.rain = rain;
		this.storageEngine = storageEngine;
	}

	/**
	 * Bind an object to the cache instance, you can read more on binding on the landing page of the documentation
	 * @param boundObject - Object to bind to this cache instance
	 */
	public bindObject(boundObject: Partial<T>, oldObject?: Partial<T> | null): this {
		this.dataTimestamp = new Date();
		this.boundObject = boundObject;
		if (oldObject) this.oldObject = oldObject;
		return this;
	}

	/**
	 * Bind a guild id to the cache
	 * @param guildId id of the guild that should be bound to this cache
	 */
	public bindGuild(guildId: string): this {
		this.boundGuild = guildId;
		return this;
	}

	/**
	 * Build an id consisting of $namespace.$id
	 * @param id id to append to namespace
	 * @returns constructed id
	 */
	public buildId(id: string): string {
		return `${this.namespace}.${id}`;
	}

	/**
	 * Add ids to the index of a namespace
	 * @param ids array of ids to add
	 * @param objectId id of the parent object of the index
	 */
	public async addToIndex(ids: Array<string>, objectId: string = this.boundGuild as string): Promise<void> {
		await this.storageEngine.addToList(this.buildId(objectId), ids);
	}

	/**
	 * Remove an id from the index
	 * @param id id to be removed
	 * @param objectId id of the parent object of the index
	 */
	public async removeFromIndex(id: string, objectId: string = this.boundGuild as string): Promise<void> {
		await this.storageEngine.removeFromList(this.buildId(objectId), [id]);
	}

	/**
	 * Check if an id is a member of an index
	 * @param id id to check
	 * @param objectId id of the parent object of the index
	 * @returns returns true if it is a part of the index, false otherwise
	 */
	public async isIndexed(id: string, objectId: string = this.boundGuild as string): Promise<boolean> {
		return this.storageEngine.isListMember(this.buildId(objectId), id);
	}

	/**
	 * Get all members from an index
	 * @param objectId id of the parent object of the index
	 */
	public async getIndexMembers(objectId: string = this.boundGuild as string): Promise<Array<string>> {
		return this.storageEngine.getListMembers(this.buildId(objectId));
	}

	/**
	 * Delete an index
	 * @param objectId id of the parent object of the index
	 */
	public async removeIndex(objectId: string = this.boundGuild as string): Promise<void> {
		await this.storageEngine.removeList(this.buildId(objectId));
	}

	/**
	 * Get the number of elements that are within an index
	 * @param objectId id of the parent object of the index
	 */
	public async getIndexCount(objectId: string = this.boundGuild as string): Promise<number> {
		return this.storageEngine.getListCount(this.buildId(objectId));
	}

	/**
	 * Delete keys from data if necessary based on RainCache structureDefs options and return the cleaned data
	 * @param data The data to possibly delete object entries from
	 */
	public structurize<D extends { [key: string]: any }>(data: D): Partial<D> {
		let ns = this.namespace;
		if (this.namespace === "permissionoverwrite") ns = "permOverwrite";
		else if (this.namespace === "voicestates") ns = "voiceState";

		const structDefs = this.rain.options.structureDefs;
		if (!structDefs) throw new Error("Did you delete the structureDefs property from your RainCache instance?");
		const options: { whitelist: Array<string>, blacklist: Array<string> } = structDefs[ns] || { whitelist: [], blacklist: [] };

		const keys = Object.keys(data);

		if (options.whitelist.length) {
			for (const key of keys) {
				if (!options.whitelist.includes(key)) delete data[key];
			}
		} else {
			if (options.blacklist.length) {
				for (const key of keys) {
					if (options.blacklist.includes(key)) delete data[key];
				}
			}
		}

		return data;
	}
}

export default BaseCache;
