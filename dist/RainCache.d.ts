/// <reference types="node" />
import { EventEmitter } from "events";
import EventProcessor from "./EventProcessor";
import RedisStorageEngine from "./storageEngine/RedisStorageEngine";
import MemoryStorageEngine from "./storageEngine/MemoryStorageEngine";
import BaseConnector from "./connector/BaseConnector";
import AmqpConnector from "./connector/AmqpConnector";
import DirectConnector from "./connector/DirectConnector";
/**
 * RainCache - Main class used for accessing caches via subclasses and initializing the whole library
 */
declare class RainCache<Inbound extends BaseConnector, Outbound extends BaseConnector> extends EventEmitter {
    options: Required<import("./types").RainCacheOptions>;
    ready: boolean;
    inbound: Inbound;
    outbound: Outbound;
    cache: import("./types").Caches;
    eventProcessor: EventProcessor;
    static Connectors: {
        AmqpConnector: typeof AmqpConnector;
        DirectConnector: typeof DirectConnector;
    };
    Connectors: {
        AmqpConnector: typeof AmqpConnector;
        DirectConnector: typeof DirectConnector;
    };
    static Engines: {
        RedisStorageEngine: typeof RedisStorageEngine;
        MemoryStorageEngine: typeof MemoryStorageEngine;
    };
    Engines: {
        RedisStorageEngine: typeof RedisStorageEngine;
        MemoryStorageEngine: typeof MemoryStorageEngine;
    };
    /**
     * Create a new Cache instance
     * @param options Options that should be used by RainCache
     */
    constructor(options: import("./types").RainCacheOptions, inboundConnector: Inbound, outboundConnector: Outbound);
    initialize(): Promise<void>;
    private _createCaches;
    private _getEngine;
}
export = RainCache;
