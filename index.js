const Raincache = require('./src/RainCache');

function RainCache(...args) {
    return new Raincache(...args);
}

RainCache.Connectors = {
    AmqpConnector: require('./src/connector/AmqpConnector'),
    DirectConnector: require('./src/connector/DirectConnector'),
};

RainCache.Engines = {
    RedisStorageEngine: require('./src/storageEngine/RedisStorageEngine'),
};
Raincache.Structures = {
    BaseStructure: require('./src/structures/BaseStructure')
};
module.exports = RainCache;
