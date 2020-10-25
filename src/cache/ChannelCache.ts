import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";

/**
 * Cache responsible for storing channel related data
 */
class ChannelCache extends BaseCache<import("../types").Channel> {
	public channelMap: import("./ChannelMapCache");
	public permissionOverwrites: import("./PermissionOverwriteCache");
	public recipients: import("./UserCache");
	public namespace: "channel";

	/**
	 * Create a new ChanneCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param storageEngine storage engine to use for this cache
	 * @param channelMap Instantiated ChannelMap class
	 * @param permissionOverwriteCache Instantiated PermissionOverwriteCache class
	 * @param userCache Instantiated UserCache class
	 * @param boundObject Optional, may be used to bind a channel object to this cache
	 */
	public constructor(storageEngine: BaseStorageEngine<import("../types").Channel>, channelMap: import("./ChannelMapCache"), permissionOverwriteCache: import("./PermissionOverwriteCache"), userCache: import("./UserCache"), boundObject?: import("../types").Channel) {
		super();
		this.storageEngine = storageEngine;
		this.namespace = "channel";
		this.channelMap = channelMap;
		this.permissionOverwrites = permissionOverwriteCache;
		this.recipients = userCache;
		if (boundObject) {
			this.bindObject(boundObject);
		}
	}

	/**
	 * Get a channel via id
	 * @param id id of the channel
	 * @returns ChannelCache with bound object or null if nothing was found
	 */
	public async get(id: string): Promise<ChannelCache | null> {
		if (this.boundObject) {
			return this;
		}
		const channel = await this.storageEngine?.get(this.buildId(id));
		if (channel) {
			return new ChannelCache(this.storageEngine as BaseStorageEngine<import("../types").Channel>, this.channelMap, this.permissionOverwrites.bindChannel(channel.id), this.recipients, channel);
		} else {
			return null;
		}
	}

	/**
	 * Upsert a channel into the cache
	 * @param id id of the channel
	 * @param data data to insert
	 */
	public async update(id: string, data: import("../types").Channel) {
		if (this.boundObject) {
			this.bindObject(data); //using bindobject() to assure the data of the class is valid
		}
		if (data.guild_id) {
			await this.channelMap.update(data.guild_id, [data.id]);
		} else if (data.recipients) {
			if (data.recipients[0]) {
				await this.channelMap.update(data.recipients[0].id, [data.id], "user");
			}
		}
		if (data.permission_overwrites) {
			for (const overwrite of data.permission_overwrites) {
				await this.permissionOverwrites.update(overwrite.id, id, overwrite);
			}
		}
		delete data.permission_overwrites;
		delete data.recipients;
		await this.addToIndex([id]);
		await this.storageEngine?.upsert(this.buildId(id), data);
		if (this.boundObject) return this;
		const channel = await this.storageEngine?.get(this.buildId(id));
		if (channel) return new ChannelCache(this.storageEngine as BaseStorageEngine<import("../types").Channel>, this.channelMap, this.permissionOverwrites.bindChannel(channel.id), this.recipients, channel);
		else return this;
	}

	/**
	 * Remove a channel from the cache
	 * @param id id of the channel
	 */
	public async remove(id: string): Promise<void> {
		const channel = await this.storageEngine?.get(this.buildId(id));
		if (channel) {
			await this.removeFromIndex(id);
			return this.storageEngine?.remove(this.buildId(id));
		} else {
			return undefined;
		}
	}

	/**
	 * Filter through the collection of channels
	 * @param fn Filter function
	 * @param channelMap Array of ids used for the filter
	 * @returns array of channel caches with bound results
	 */
	public async filter(fn: (channel?: import("../types").Channel, index?: number, array?: Array<import("../types").Channel>) => unknown, channelMap?: Array<string>): Promise<Array<ChannelCache>> {
		const channels = await this.storageEngine?.filter(fn, channelMap, this.namespace) || [];
		return channels.map(c => new ChannelCache(this.storageEngine as BaseStorageEngine<import("../types").Channel>, this.channelMap, this.permissionOverwrites.bindChannel(c.id), this.recipients, c));
	}

	/**
	 * Filter through the collection of channels and return on the first result
	 * @param fn Filter function
	 * @param channelMap Array of ids used for the filter
	 * @returns First result bound to a channel cache
	 */
	public async find(fn: (channel?: import("@amanda/discordtypings").ChannelData) => unknown, channelMap: Array<string>): Promise<ChannelCache | null> {
		const channel = await this.storageEngine?.find(fn, channelMap, this.namespace);
		if (!channel) return null;
		return new ChannelCache(this.storageEngine as BaseStorageEngine<import("../types").Channel>, this.channelMap, this.permissionOverwrites.bindChannel(channel.id), this.recipients, channel);
	}

	/**
	 * Add channels to the channel index
	 * @param ids ids of the channels
	 */
	public async addToIndex(ids: Array<string>): Promise<void> {
		return this.storageEngine?.addToList(this.namespace, ids);
	}

	/**
	 * Remove a channel from the index
	 * @param id id of the channel
	 */
	public async removeFromIndex(id: string): Promise<void> {
		return this.storageEngine?.removeFromList(this.namespace, id);
	}

	/**
	 * Check if a channel is indexed
	 * @param id - id of the channel
	 */
	public async isIndexed(id: string): Promise<boolean> {
		return this.storageEngine?.isListMember(this.namespace, id) || false;
	}

	/**
	 * Get a list of ids of indexed channels
	 */
	public async getIndexMembers(): Promise<Array<string>> {
		return this.storageEngine?.getListMembers(this.namespace) || [];
	}

	/**
	 * Remove the channel index, you should probably not call this at all :<
	 */
	public async removeIndex(): Promise<void> {
		return this.storageEngine?.removeList(this.namespace);
	}

	/**
	 * Get the number of channels that are currently cached
	 * @returns Number of channels currently cached
	 */
	public async getIndexCount(): Promise<number> {
		return this.storageEngine?.getListCount(this.namespace) || 0;
	}
}

export = ChannelCache;
