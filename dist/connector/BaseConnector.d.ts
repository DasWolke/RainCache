/// <reference types="node" />
import { EventEmitter } from "events";
/**
 * BaseConnector class, provides a common structure for connectors
 */
declare class BaseConnector extends EventEmitter {
    ready: boolean;
    constructor();
    initialize(): Promise<void>;
    send(event: any): void;
}
export = BaseConnector;
