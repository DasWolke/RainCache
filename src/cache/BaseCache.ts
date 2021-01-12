class BaseCache<T> {
	public storageEngine: import("../storageEngine/BaseStorageEngine")<T> | null;
	public namespace: string;
	public dataTimestamp?: Date;
	public boundObject: T | null = null;
	/** guild id bound to this cache */
	public boundGuild?: string;
	public rain: import("../RainCache")<any, any>;

	/**
	 * Base class for all cache classes.
	 *
	 * You should **not** create BaseCache by itself, but instead create a class that extends from it.
	 *
	 * **All Methods from BaseCache are also available on every class that is extending it.**
	 */
	public constructor(rain: import("../RainCache")<any, any>) {
		this.storageEngine = null;
		this.namespace = "base";
		this.rain = rain;
	}

	/**
	 * Bind an object to the cache instance, you can read more on binding on the landing page of the documentation
	 * @param boundObject - Object to bind to this cache instance
	 */
	public bindObject(boundObject: T): void {
		this.dataTimestamp = new Date();
		this.boundObject = boundObject;
		Object.assign(this, boundObject);
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
	 * @param id ids to add
	 * @param objectId id of the parent object of the index
	 */
	public async addToIndex(id: string, objectId: string = this.boundGuild as string): Promise<void> {
		return this.storageEngine?.addToList(this.buildId(objectId), id);
	}

	/**
	 * Remove an id from the index
	 * @param id id to be removed
	 * @param objectId id of the parent object of the index
	 */
	public async removeFromIndex(id: string, objectId: string = this.boundGuild as string): Promise<void> {
		return this.storageEngine?.removeFromList(this.buildId(objectId), id);
	}

	/**
	 * Check if an id is a member of an index
	 * @param id id to check
	 * @param objectId id of the parent object of the index
	 * @returns returns true if it is a part of the index, false otherwise
	 */
	public async isIndexed(id: string, objectId: string = this.boundGuild as string): Promise<boolean> {
		return (this.storageEngine as import("../storageEngine/BaseStorageEngine")<T>).isListMember(this.buildId(objectId), id);
	}

	/**
	 * Get all members from an index
	 * @param objectId id of the parent object of the index
	 */
	public async getIndexMembers(objectId: string = this.boundGuild as string): Promise<Array<string>> {
		return this.storageEngine?.getListMembers(this.buildId(objectId)) || [];
	}

	/**
	 * Delete an index
	 * @param objectId id of the parent object of the index
	 */
	public async removeIndex(objectId: string = this.boundGuild as string): Promise<void> {
		return this.storageEngine?.removeList(this.buildId(objectId));
	}

	/**
	 * Get the number of elements that are within an index
	 * @param objectId id of the parent object of the index
	 */
	public async getIndexCount(objectId: string = this.boundGuild as string): Promise<number> {
		return (this.storageEngine as import("../storageEngine/BaseStorageEngine")<T>).getListCount(this.buildId(objectId));
	}

	/**
	 * Delete keys from data if necessary based on RainCache structureDefs options and return the cleaned data
	 * @param data The data to possibly delete object entries from
	 */
	public structurize<T>(data: T): T {
		if (this.namespace === "base") throw new Error("Do not call structurize in BaseCache instances. Only extensions.");
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

export = BaseCache;
