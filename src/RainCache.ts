import { EventEmitter } from "events";

import EventProcessor from "./EventProcessor";

import RedisStorageEngine from "./storageEngine/RedisStorageEngine";

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

/**
 * RainCache - Main class used for accessing caches via subclasses and initializing the whole library
 */
class RainCache<Inbound extends BaseConnector, Outbound extends BaseConnector> extends EventEmitter {
	public options: import("./types").RainCacheOptions;
	public ready: boolean;
	public inbound: Inbound;
	public outbound: Outbound;
	public cache: import("./types").Caches;
	public eventProcessor: EventProcessor;

	/**
	 * Create a new Cache instance
	 * @param options Options that should be used by RainCache
	 */
	public constructor(options: import("./types").RainCacheOptions, inboundConnector: Inbound, outboundConnector: Outbound) {
		super();
		if (!options.storage) {
			throw new Error("No storage engines were passed");
		}
		if (!options.cacheClasses) {
			options.cacheClasses = {
				// @ts-ignore
				guild: GuildCache,
				// @ts-ignore
				channel: ChannelCache,
				// @ts-ignore
				channelMap: ChannelMap,
				// @ts-ignore
				member: MemberCache,
				// @ts-ignore
				user: UserCache,
				// @ts-ignore
				role: RoleCache,
				// @ts-ignore
				emoji: EmojiCache,
				// @ts-ignore
				presence: PresenceCache,
				// @ts-ignore
				permOverwrite: PermissionsOverwriteCache,
				// @ts-ignore
				voiceState: VoiceStateCache
			};
		}
		if (!options.storage.default) {
			// maybe warn that no default engine was passed ? :thunkong:
		}
		if (!options.disabledEvents) {
			options.disabledEvents = {};
		}
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
		this.options = options;
		this.ready = false;
		this.inbound = inboundConnector;
		this.outbound = outboundConnector;
	}

	public static get Connectors() {
		return {
			AmqpConnector,
			DirectConnector
		};
	}

	public get Connectors() {
		return RainCache.Connectors;
	}

	public static get Engines() {
		return {
			RedisStorageEngine
		};
	}

	public get Engines() {
		return RainCache.Engines;
	}

	public async initialize() {
		try {
			for (const engine in this.options.storage) {
				// eslint-disable-next-line no-prototype-builtins
				if (this.options.storage.hasOwnProperty(engine)) {
					if (!this.options.storage[engine].ready) {
						await this.options.storage[engine].initialize();
					}
				}
			}
		} catch (e) {
			throw new Error("Failed to initialize storage engines");
		}
		// @ts-ignore
		this.cache = this._createCaches(this.options.storage, this.options.cacheClasses);
		Object.assign(this, this.cache);
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
		if (this.inbound && !this.inbound.ready) {
			await this.inbound.initialize();
		}
		if (this.outbound && !this.outbound.ready) {
			await this.outbound.initialize();
		}
		if (this.inbound) {
			this.inbound.on("event", async (event) => {
				try {
					await this.eventProcessor.inbound(event);
					if (this.outbound) {
						this.outbound.send(event);
					}
				}
				catch (e) {
					this.emit("error", e);
				}
			});
		}
		if (this.options.debug) {
			this.eventProcessor.on("debug", (log) => this.emit("debug", log));
		}
		this.ready = true;
	}

	private _createCaches(engines: import("./types").RainCacheOptions["storage"], cacheClasses: import("./types").CacheTypes) {
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
			caches["member"] = new cacheClasses["member"](engine, caches["user"], this);
		}
		if (cacheClasses["presence"]) {
			const engine = this._getEngine(engines, "presence");
			caches["presence"] = new cacheClasses["presence"](engine, caches["user"], this);
		}
		if (cacheClasses["channelMap"]) {
			const engine = this._getEngine(engines, "channelMap");
			caches["channelMap"] = new cacheClasses["channelMap"](engine, this);
		}
		if (cacheClasses["channel"]) {
			const engine = this._getEngine(engines, "channel");
			caches["channel"] = new cacheClasses["channel"](engine, caches["channelMap"], caches["permOverwrite"], caches["user"], this);
		}
		if (cacheClasses["guild"]) {
			const engine = this._getEngine(engines, "guild");
			caches["guild"] = new cacheClasses["guild"](engine, caches["channel"], caches["role"], caches["member"], caches["emoji"], caches["presence"], caches["channelMap"], this);
		}
		if (cacheClasses["voiceState"]) {
			const engine = this._getEngine(engines, "voiceState");
			caches["voiceState"] = new cacheClasses["voiceState"](engine, this);
		}
		return caches;
	}

	private _getEngine(engines: import("./types").RainCacheOptions["storage"], engine: keyof import("./types").RainCacheOptions["storage"]) {
		return engines[engine] || engines["default"];
	}
}

export = RainCache;
