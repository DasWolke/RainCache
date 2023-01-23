import { EventEmitter } from "events";

import EventProcessor from "./EventProcessor";

import RedisStorageEngine from "./storageEngine/RedisStorageEngine";
import MemoryStorageEngine from "./storageEngine/MemoryStorageEngine";

import BaseConnector from "./connector/BaseConnector";
import AmqpConnector from "./connector/AmqpConnector";
import DirectConnector from "./connector/DirectConnector";

import GuildCache from "./cache/GuildCache";
import ChannelCache from "./cache/ChannelCache";
import ChannelMap from "./cache/ChannelMapCache";
import MemberCache from "./cache/MemberCache";
import UserCache from "./cache/UserCache";
import RoleCache from "./cache/RoleCache";
import EmojiCache from "./cache/EmojiCache";
import PresenceCache from "./cache/PresenceCache";
import PermissionsOverwriteCache from "./cache/PermissionOverwriteCache";
import VoiceStateCache from "./cache/VoiceStateCache";

interface RainCacheEvents {
	error: [Error];
	debug: [string];
}

interface RainCache<Inbound extends BaseConnector, Outbound extends BaseConnector> {
	addListener<E extends keyof RainCacheEvents>(event: E, listener: (...args: RainCacheEvents[E]) => any): this;
	emit<E extends keyof RainCacheEvents>(event: E, ...args: RainCacheEvents[E]): boolean;
	eventNames(): Array<keyof RainCacheEvents>;
	listenerCount(event: keyof RainCacheEvents): number;
	listeners(event: keyof RainCacheEvents): Array<(...args: Array<any>) => any>;
	off<E extends keyof RainCacheEvents>(event: E, listener: (...args: RainCacheEvents[E]) => any): this;
	on<E extends keyof RainCacheEvents>(event: E, listener: (...args: RainCacheEvents[E]) => any): this;
	once<E extends keyof RainCacheEvents>(event: E, listener: (...args: RainCacheEvents[E]) => any): this;
	prependListener<E extends keyof RainCacheEvents>(event: E, listener: (...args: RainCacheEvents[E]) => any): this;
	prependOnceListener<E extends keyof RainCacheEvents>(event: E, listener: (...args: RainCacheEvents[E]) => any): this;
	rawListeners(event: keyof RainCacheEvents): Array<(...args: Array<any>) => any>;
	removeAllListeners(event?: keyof RainCacheEvents): this;
	removeListener<E extends keyof RainCacheEvents>(event: E, listener: (...args: RainCacheEvents[E]) => any): this;
}

/**
 * RainCache - Main class used for accessing caches via subclasses and initializing the whole library
 */
class RainCache<Inbound extends BaseConnector, Outbound extends BaseConnector> extends EventEmitter {
	public options: Required<import("./types").RainCacheOptions>;
	public ready = false;
	public inbound: Inbound;
	public outbound: Outbound;
	public cache: import("./types").Caches;
	public eventProcessor: EventProcessor;

	public static Connectors = { AmqpConnector, DirectConnector };
	public Connectors = RainCache.Connectors;

	public static Engines = { RedisStorageEngine, MemoryStorageEngine };
	public Engines = RainCache.Engines;

	/**
	 * Create a new Cache instance
	 * @param options Options that should be used by RainCache
	 */
	public constructor(options: import("./types").RainCacheOptions, inboundConnector: Inbound, outboundConnector: Outbound) {
		super();
		if (!options.storage) throw new Error("No storage engines were passed");
		if (!options.cacheClasses) {
			options.cacheClasses = {
				guild: GuildCache,
				channel: ChannelCache,
				channelMap: ChannelMap,
				member: MemberCache,
				user: UserCache,
				role: RoleCache,
				emoji: EmojiCache,
				presence: PresenceCache,
				permOverwrite: PermissionsOverwriteCache,
				voiceState: VoiceStateCache
			};
		}
		// if (!options.storage.default) maybe warn that no default engine was passed ? :thunkong:
		if (!options.disabledEvents) options.disabledEvents = {};
		if (!options.disabledCaches) options.disabledCaches = {};
		if (!options.structureDefs) {
			options.structureDefs = {
				guild: { whitelist: [], blacklist: [] },
				channel: { whitelist: [], blacklist: [] },
				member: { whitelist: [], blacklist: [] },
				user: { whitelist: [], blacklist: [] },
				role: { whitelist: [], blacklist: [] },
				emoji: { whitelist: [], blacklist: [] },
				presence: { whitelist: [], blacklist: [] },
				permOverwrite: { whitelist: [], blacklist: [] },
				voiceState: { whitelist: [], blacklist: [] }
			};
		}
		this.options = options as Required<import("./types").RainCacheOptions>;
		this.ready = false;
		this.inbound = inboundConnector;
		this.outbound = outboundConnector;
	}

	public async initialize() {
		try {
			for (const engine in this.options.storage) {
				if (Object.hasOwnProperty.call(this.options.storage, engine)) {
					if (!this.options.storage[engine].ready) await this.options.storage[engine].initialize();
				}
			}
		} catch (e) {
			throw new Error("Failed to initialize storage engines");
		}
		this.cache = this._createCaches(this.options.storage as Required<import("./types").RainCacheOptions["storage"]>, this.options.cacheClasses as import("./types").CacheTypes);
		this.eventProcessor = new EventProcessor({
			disabledEvents: this.options.disabledEvents || {},
			cache: {
				guild: this.cache.guild,
				channel: this.cache.channel,
				channelMap: this.cache.channelMap,
				member: this.cache.member,
				user: this.cache.user,
				role: this.cache.role,
				emoji: this.cache.emoji,
				presence: this.cache.presence,
				permOverwrite: this.cache.permOverwrite,
				voiceState: this.cache.voiceState
			}
		});
		if (this.inbound && !this.inbound.ready) await this.inbound.initialize();
		if (this.outbound && !this.outbound.ready) await this.outbound.initialize();
		if (this.inbound) {
			this.inbound.on("event", async event => {
				try {
					await this.eventProcessor.inbound(event);
					if (this.outbound) this.outbound.send(event);
				} catch (e) {
					this.emit("error", e);
				}
			});
		}
		if (this.options.debug) this.eventProcessor.on("debug", (log) => this.emit("debug", log));
		this.ready = true;
	}

	private _createCaches(engines: Required<import("./types").RainCacheOptions["storage"]>, cacheClasses: import("./types").CacheTypes) {
		const caches: import("./types").Caches = {} as import("./types").Caches;
		if (cacheClasses["role"]) {
			const engine = this._getEngine(engines, "role");
			caches["role"] = new cacheClasses["role"](engine, this);
		}
		if (cacheClasses["emoji"]) {
			const engine = this._getEngine(engines, "emoji");
			caches["emoji"] = new cacheClasses["emoji"](engine, this);
		}
		if (cacheClasses["permOverwrite"]) {
			const engine = this._getEngine(engines, "permOverwrite");
			caches["permOverwrite"] = new cacheClasses["permOverwrite"](engine, this);
		}
		if (cacheClasses["user"]) {
			const engine = this._getEngine(engines, "user");
			caches["user"] = new cacheClasses["user"](engine, this);
		}
		if (cacheClasses["member"]) {
			const engine = this._getEngine(engines, "member");
			caches["member"] = new cacheClasses["member"](engine, this, caches["user"]);
		}
		if (cacheClasses["presence"]) {
			const engine = this._getEngine(engines, "presence");
			caches["presence"] = new cacheClasses["presence"](engine, this, caches["user"]);
		}
		if (cacheClasses["channelMap"]) {
			const engine = this._getEngine(engines, "channelMap");
			caches["channelMap"] = new cacheClasses["channelMap"](engine, this);
		}
		if (cacheClasses["channel"]) {
			const engine = this._getEngine(engines, "channel");
			caches["channel"] = new cacheClasses["channel"](engine, this, caches["channelMap"], caches["permOverwrite"], caches["user"]);
		}
		if (cacheClasses["guild"]) {
			const engine = this._getEngine(engines, "guild");
			caches["guild"] = new cacheClasses["guild"](engine, this, caches["channel"], caches["role"], caches["member"], caches["emoji"], caches["presence"], caches["channelMap"]);
		}
		if (cacheClasses["voiceState"]) {
			const engine = this._getEngine(engines, "voiceState");
			caches["voiceState"] = new cacheClasses["voiceState"](engine, this, caches["member"]);
		}
		return caches;
	}

	private _getEngine<E extends Required<import("./types").RainCacheOptions["storage"]>, N extends Exclude<keyof E, "default">>(engines: E, engine: N): E[N] {
		return engines[engine] || engines["default"] as E[N];
	}
}

export default RainCache;
