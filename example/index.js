"use strict";

const RainCache = require("../");

const AmqpConnector = RainCache.Connectors.AmqpConnector;
const Redis = RainCache.Engines.RedisStorageEngine;

const con = new AmqpConnector();
const cache = new RainCache({ storage: { default: new Redis() }, debug: false }, con, con);

cache.on("debug", (data) => {
	console.log(data);
});

const init = async () => {
	await cache.initialize();
};
init().then(async () => {
	console.log("owo");
}).catch(e => console.error(e));
