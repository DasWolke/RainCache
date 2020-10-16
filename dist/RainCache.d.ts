/// <reference types="node" />
import { EventEmitter } from "events";
import EventProcessor from "./EventProcessor";
import RedisStorageEngine from "./storageEngine/RedisStorageEngine";
import BaseConnector from "./connector/BaseConnector";
import AmqpConnector from "./connector/AmqpConnector";
import DirectConnector from "./connector/DirectConnector";
declare class RainCache<Inbound extends BaseConnector, Outbound extends BaseConnector> extends EventEmitter {
    options: import("./types").RainCacheOptions;
    ready: boolean;
    inbound: Inbound;
    outbound: Outbound;
    cache: import("./types").Caches;
    eventProcessor: EventProcessor;
    constructor(options: import("./types").RainCacheOptions, inboundConnector: Inbound, outboundConnector: Outbound);
    static get Connectors(): {
        AmqpConnector: typeof AmqpConnector;
        DirectConnector: typeof DirectConnector;
    };
    static get Engines(): {
        RedisStorageEngine: typeof RedisStorageEngine;
    };
    initialize(): Promise<void>;
    _createCaches(engines: import("./types").RainCacheOptions["storage"], cacheClasses: import("./types").CacheTypes): import("./types").Caches;
    _getEngine(engines: import("./types").RainCacheOptions["storage"], engine: keyof import("./types").RainCacheOptions["storage"]): import("./storageEngine/BaseStorageEngine")<any>;
}
export = RainCache;
