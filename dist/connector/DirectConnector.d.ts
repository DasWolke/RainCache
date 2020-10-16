import BaseConnector from "./BaseConnector";
declare class DirectConnector extends BaseConnector {
    constructor();
    initialize(): Promise<null>;
    receive(event: any): void;
    send(event: any): void;
}
export = DirectConnector;
