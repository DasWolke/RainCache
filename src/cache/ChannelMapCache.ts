import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";

/**
 * Cache for providing a guild/user -> channels map
 */
class ChannelMapCache extends BaseCache<import("../types").ChannelMap> {
	public namespace: "channelmap" = "channelmap";
	public storageEngine: BaseStorageEngine<import("../types").ChannelMap> ;

	/**
	 * Create a new ChannelMapCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param storageEngine storage engine to use for this cache
	 * @param boundObject Optional, may be used to bind the map object to the cache
	 */
	public constructor(storageEngine: BaseStorageEngine<import("../types").ChannelMap>, rain: import("../RainCache")<any, any>, boundObject?: import("../types").ChannelMap) {
		super(rain);
		this.storageEngine = storageEngine;
		if (boundObject) this.bindObject(boundObject);
	}

	/**
	 * Get a ChannelMap via id of the guild or the user
	 * @param id Id of the user or the guild
	 * @param type Type of the map to get
	 */
	public async get(id: string, type: "guild" | "user" = "guild"): Promise<ChannelMapCache | null> {
		if (this.boundObject) return this;
		const channelMapId = this.buildId(this._buildMapId(id, type));
		const channelMap = await this.storageEngine.getListMembers(channelMapId);
		if (channelMap) return new ChannelMapCache(this.storageEngine, this.rain, this._buildMap(id, channelMap, type));
		else return null;
	}

	/**
	 * Upsert a ChannelMap
	 * @param id Id of the user or the guild
	 * @param data Array of channel ids
	 * @param type Type of the map to upsert
	 * @param remove Remove old channels that don't exist anymore
	 */
	public async update(id: string, data: Array<string>, type: "guild" | "user" = "guild", remove = false): Promise<ChannelMapCache> {
		if (this.boundObject) this.bindObject(this._buildMap(id, data, type)); //using bindobject() to assure the data of the class is valid
		let oldCacheData = await this.get(id, type);
		if (oldCacheData && !remove) data = this._checkDupes(oldCacheData.channels as Array<string>, data);
		if (remove) {
			if (!oldCacheData) oldCacheData = { channels: [] } as unknown as ChannelMapCache;
			data = this._removeOldChannels(oldCacheData.channels as Array<string>, data);
		}
		const channelMapId = this.buildId(this._buildMapId(id, type));
		await this.remove(id, type);
		await Promise.all(data.map(i => this.storageEngine.addToList(channelMapId, i)));
		if (this.boundObject) return this;
		return new ChannelMapCache(this.storageEngine, this.rain, this._buildMap(id, data, type));
	}

	/**
	 * Remove a ChannelMap
	 * @param {string} id Id of the user or the guild
	 * @param {string} [type=guild] Type of the map to remove
	 * @returns {Promise<null>}
	 */
	public async remove(id: string, type: "guild" | "user" = "guild"): Promise<void> {
		const channelMapId = this.buildId(this._buildMapId(id, type));
		void this.storageEngine.remove(channelMapId);
	}

	/**
	 * Remove old channels from the array of mapped channels
	 * @param oldChannels Array of old channels
	 * @param removeChannels Array of new channels
	 * @returns Array of filtered channels
	 */
	private _removeOldChannels(oldChannels: Array<string>, removeChannels: Array<string>): Array<string> {
		for (const removeId of removeChannels) {
			if (oldChannels.indexOf(removeId) > -1) oldChannels.splice(oldChannels.indexOf(removeId), 1);
		}
		return oldChannels;
	}

	/**
	 * Checks for duplicate ids in the provided arrays
	 * @param oldIds Array of old ids
	 * @param newIds Array of new ids
	 * @returns Array of non duplicated Ids
	 */
	private _checkDupes(oldIds: Array<string>, newIds: Array<string>): Array<string> {
		for (const oldId of oldIds) {
			if (newIds.indexOf(oldId) > -1) newIds.splice(newIds.indexOf(oldId), 1);
		}
		return oldIds.concat(newIds);
	}

	/**
	 * Build a unique key id for the channel map
	 * @param id Id of the guild/user
	 * @param type Type of the map
	 */
	private _buildMapId(id: string, type: string): string {
		return `${type}.${id}`;
	}

	/**
	 * Build a map object which is bound to the channelMapCache object
	 * @param id Id of the guild/user
	 * @param channels Array of channel ids
	 * @param type - type of the map
	 */
	private _buildMap(id: string, channels: Array<string>, type: "guild" | "user"): import("../types").ChannelMap {
		return { id, channels, type };
	}
}

export = ChannelMapCache;
