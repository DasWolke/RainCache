'use strict';
let RainCache = require('../src/RainCache');
let AmqpConnector = require('../src/connector/AmqpConnector');
let Redis = require('../src/storageEngine/RedisStorageEngine');
let con = new AmqpConnector({});
let cache = new RainCache({storage: {default: new Redis({host: 'localhost'})}, debug: false}, con, con);
let blocked = require('blocked');
const util = require("util");
blocked(ms => {
    console.log(`Blocked for ${ms}ms`);
}, {threshold: 20});
let init = async () => {
    await cache.initialize();
};
cache.on('debug', (data) => {
    console.log(data);
});
init().then(async () => {
    console.log('owo');
}).catch(e => console.error(e));

process.on('unhandledRejection', (reason, promise) => {
    if (!reason) {
        return;
    }
    console.error(`Unhandled Rejection ${util.inspect(promise)}`);
});
