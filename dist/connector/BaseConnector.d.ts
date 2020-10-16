/// <reference types="node" />
import { EventEmitter } from "events";
declare class BaseConnector extends EventEmitter {
    ready: boolean;
    constructor();
    initialize(): Promise<void>;
    send(event: any): void;
}
export = BaseConnector;
