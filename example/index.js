"use strict";

const { RainCache, DirectConnector, MemoryStorageEngine } = require("../");

const con = new DirectConnector();
const cache = new RainCache({ storage: { default: new MemoryStorageEngine() }, debug: false }, con, con);

cache.on("debug", console.log);

const init = async () => {
	await cache.initialize();
};
init().then(async () => {
	console.log("owo");
}).catch(e => console.error(e));
