"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const BaseStorageEngine_1 = __importDefault(require("./BaseStorageEngine"));
class MemoryStorageEngine extends BaseStorageEngine_1.default {
    constructor() {
        super();
        this.map = new Map();
        this.index = new Map();
    }
    get(id) {
        const raw = this.map.get(id);
        return this.parseData(raw);
    }
    upsert(id, updateData) {
        const data = this.get(id);
        const newData = data || {};
        Object.assign(newData, updateData);
        const prepared = this.prepareData(newData);
        this.map.set(id, prepared);
    }
    remove(id) {
        this.map.delete(id);
    }
    filter(fn, ids, namespace) {
        const resolvedDataArray = [];
        let data = [];
        if (!ids) {
            data = this.getListMembers(namespace);
        }
        else {
            data = ids;
        }
        data = data.map(id => `${namespace}.${id}`);
        for (const key of data) {
            const resolvedData = this.get(key);
            if (resolvedData)
                resolvedDataArray.push(resolvedData);
        }
        return resolvedDataArray.filter(fn);
    }
    find(fn, ids = null, namespace) {
        let data = [];
        if (typeof ids === "string" && !namespace) {
            namespace = ids;
            ids = null;
        }
        if (!ids) {
            data = this.getListMembers(namespace);
        }
        else {
            data = ids;
        }
        data = data.map(id => `${namespace}.${id}`);
        let index = 0;
        for (const key of data) {
            const resolvedData = this.get(key);
            if (resolvedData && fn(resolvedData, index, data)) {
                return resolvedData;
            }
            index++;
        }
        return null;
    }
    getListMembers(listId) {
        return this.index.get(listId) || [];
    }
    addToList(listId, id) {
        const list = this.getListMembers(listId);
        if (list.includes(id))
            return;
        else
            list.push(id);
        const listExists = !!this.index.get(listId);
        if (!listExists)
            this.index.set(listId, list);
    }
    isListMember(listId, id) {
        return this.getListMembers(listId).includes(id);
    }
    removeFromList(listId, id) {
        const list = this.getListMembers(listId);
        const index = list.indexOf(id);
        if (index === -1)
            return;
        list.splice(index, 1);
    }
    removeList(listId) {
        this.index.delete(listId);
    }
    getListCount(listId) {
        return this.getListMembers(listId).length;
    }
    prepareData(data) {
        return JSON.stringify(data);
    }
    parseData(data) {
        return data ? JSON.parse(data) : null;
    }
}
module.exports = MemoryStorageEngine;
