'use strict';
let RainCache = require('../src/RainCache');
let AmqpConnector = require('../src/connector/AmqpConnector');
let Redis = require('../src/storageEngine/RedisStorageEngine');
let con = new AmqpConnector({});
let cache = new RainCache({storage: {default: new Redis({host: 'localhost'})}, debug: true}, con);
let init = async () => {
    await cache.initialize();
};
cache.on('debug', (data) => {
    console.log(data);
});
init().then(() => {
    console.log('owo');

}).catch(e => console.error(e));
