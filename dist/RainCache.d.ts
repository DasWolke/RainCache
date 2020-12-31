/// <reference types="node" />
import { EventEmitter } from "events";
import EventProcessor from "./EventProcessor";
import RedisStorageEngine from "./storageEngine/RedisStorageEngine";
import MemoryStorageEngine from "./storageEngine/MemoryStorageEngine";
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
    get Connectors(): {
        AmqpConnector: typeof AmqpConnector;
        DirectConnector: typeof DirectConnector;
    };
    static get Engines(): {
        RedisStorageEngine: typeof RedisStorageEngine;
        MemoryStorageEngine: typeof MemoryStorageEngine;
    };
    get Engines(): {
        RedisStorageEngine: typeof RedisStorageEngine;
        MemoryStorageEngine: typeof MemoryStorageEngine;
    };
    initialize(): Promise<void>;
    private _createCaches;
    private _getEngine;
}
export = RainCache;
