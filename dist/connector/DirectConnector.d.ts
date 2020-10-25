import BaseConnector from "./BaseConnector";
declare class DirectConnector extends BaseConnector {
    constructor();
    initialize(): Promise<void>;
    receive(event: any): void;
    send(event: any): void;
}
export = DirectConnector;
