"use strict";

const { RainCache, AmqpConnector, RedisStorageEngine: Redis } = require("../");

const con = new AmqpConnector();
const cache = new RainCache({ storage: { default: new Redis() }, debug: false }, con, con);

cache.on("debug", console.log);

const init = async () => {
	await cache.initialize();
};
init().then(async () => {
	console.log("owo");
}).catch(e => console.error(e));
