'use strict';
let RainCache = require('../src/RainCache');
let AmqpConnector = require('../src/connector/AmqpConnector');
let Redis = require('../src/storageEngine/RedisStorageEngine');
let con = new AmqpConnector({});
let cache = new RainCache({storage: {default: new Redis({host: 'localhost'})}}, con);
let init = async () => {
    await cache.initialize();
};
init().then(() => {
    console.log('owo');
}).catch(e => console.error(e));
