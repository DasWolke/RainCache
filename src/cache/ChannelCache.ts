import BaseCache from "./BaseCache";
import BaseStorageEngine from "../storageEngine/BaseStorageEngine";

/**
 * Cache responsible for storing channel related data
 */
class ChannelCache extends BaseCache<import("discord-typings").Channel> {
	public channelMap: import("./ChannelMapCache").default;
	public permissionOverwriteCache: import("./PermissionOverwriteCache").default;
	public recipientCache: import("./UserCache").default;
	public namespace = "channel" as const;

	/**
	 * Create a new ChanneCache
	 *
	 * **This class is automatically instantiated by RainCache**
	 * @param storageEngine storage engine to use for this cache
	 * @param channelMap Instantiated ChannelMap class
	 * @param permissionOverwriteCache Instantiated PermissionOverwriteCache class
	 * @param userCache Instantiated UserCache class
	 */
	public constructor(storageEngine: BaseStorageEngine<import("discord-typings").Channel>, rain: import("../RainCache").default<any, any>, channelMap: import("./ChannelMapCache").default, permissionOverwriteCache: import("./PermissionOverwriteCache").default, userCache: import("./UserCache").default) {
		super(storageEngine, rain);
		this.channelMap = channelMap;
		this.permissionOverwriteCache = permissionOverwriteCache;
		this.recipientCache = userCache;
	}

	/**
	 * Get a channel via id
	 * @param id id of the channel
	 * @returns ChannelCache with bound object or null if nothing was found
	 */
	public async get(id: string): Promise<ChannelCache | null> {
		if (this.boundObject) return this;
		const channel = await this.storageEngine.get(this.buildId(id));
		if (!channel) return null;
		return new ChannelCache(this.storageEngine, this.rain, this.channelMap, this.permissionOverwriteCache.bindChannel(channel.id), this.recipientCache).bindObject(channel);
	}

	/**
	 * Upsert a channel into the cache
	 * @param id id of the channel
	 * @param data data to insert
	 */
	public async update(id: string, data: Partial<import("discord-typings").Channel>): Promise<ChannelCache> {
		if (this.rain.options.disabledCaches.channel) return this;
		const copy = Object.assign({}, data) as Partial<import("discord-typings").Channel>;
		if ((data as import("discord-typings").GuildChannel).guild_id) await this.channelMap.update((data as import("discord-typings").GuildChannel).guild_id, [id]);
		else if ((data as import("discord-typings").DMChannel).recipients) {
			if ((data as import("discord-typings").DMChannel).recipients[0]) await this.channelMap.update((data as import("discord-typings").DMChannel).recipients[0].id, [id], "user");
		}
		if ((data as import("discord-typings").GuildChannel).permission_overwrites) {
			for (const overwrite of (data as import("discord-typings").GuildChannel).permission_overwrites) {
				await this.permissionOverwriteCache.update(overwrite.id, id, overwrite);
			}
		}
		delete (copy as Partial<import("discord-typings").GuildChannel>).permission_overwrites;
		delete (copy as Partial<import("discord-typings").DMChannel>).recipients;
		if (this.boundObject) this.bindObject(copy); //using bindobject() to assure the data of the class is valid
		await this.addToIndex([id]);
		const old = await this.storageEngine.upsert(this.buildId(id), this.structurize(copy));
		if (this.boundObject) return this;
		return new ChannelCache(this.storageEngine, this.rain, this.channelMap, this.permissionOverwriteCache.bindChannel(id), this.recipientCache).bindObject(copy, old);
	}

	/**
	 * Remove a channel from the cache
	 * @param id id of the channel
	 */
	public async remove(id: string): Promise<void> {
		await this.removeFromIndex(id);
		await this.storageEngine.remove(this.buildId(id));
	}

	/**
	 * Filter through the collection of channels
	 * @param fn Filter function
	 * @param channelMap Array of ids used for the filter
	 * @returns array of channel caches with bound results
	 */
	public async filter(fn: (channel: import("discord-typings").Channel, index: number) => boolean, channelMap?: Array<string>): Promise<Array<ChannelCache>> {
		const channels = await this.storageEngine.filter(fn, channelMap || null, this.namespace);
		return channels.map(c => new ChannelCache(this.storageEngine, this.rain, this.channelMap, this.permissionOverwriteCache.bindChannel(c.id), this.recipientCache).bindObject(c));
	}

	/**
	 * Filter through the collection of channels and return on the first result
	 * @param fn Filter function
	 * @param channelMap Array of ids used for the filter
	 * @returns First result bound to a channel cache
	 */
	public async find(fn: (channel: import("discord-typings").Channel, index: number) => boolean, channelMap?: Array<string>): Promise<ChannelCache | null> {
		const channel = await this.storageEngine.find(fn, channelMap || null, this.namespace);
		if (!channel) return null;
		return new ChannelCache(this.storageEngine, this.rain, this.channelMap, this.permissionOverwriteCache.bindChannel(channel.id), this.recipientCache).bindObject(channel);
	}

	/**
	 * Add channels to the channel index
	 * @param ids ids of the channels
	 */
	public async addToIndex(ids: Array<string>): Promise<void> {
		await this.storageEngine.addToList(this.namespace, ids);
	}

	/**
	 * Remove a channel from the index
	 * @param id id of the channel
	 */
	public async removeFromIndex(id: string): Promise<void> {
		await this.storageEngine.removeFromList(this.namespace, [id]);
	}

	/**
	 * Check if a channel is indexed
	 * @param id - id of the channel
	 */
	public async isIndexed(id: string): Promise<boolean> {
		return this.storageEngine.isListMember(this.namespace, id);
	}

	/**
	 * Get a list of ids of indexed channels
	 */
	public async getIndexMembers(): Promise<Array<string>> {
		return this.storageEngine.getListMembers(this.namespace);
	}

	/**
	 * Remove the channel index, you should probably not call this at all :<
	 */
	public async removeIndex(): Promise<void> {
		await this.storageEngine.removeList(this.namespace);
	}

	/**
	 * Get the number of channels that are currently cached
	 * @returns Number of channels currently cached
	 */
	public async getIndexCount(): Promise<number> {
		return this.storageEngine.getListCount(this.namespace);
	}
}

export default ChannelCache;
