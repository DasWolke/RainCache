const Raincache = require('./src/RainCache');

function RainCache(...args) {
    return new Raincache(...args);
}

module.exports.Connectors = {
    AmqpConnector: require('./src/connector/AmqpConnector'),
    DirectConnector: require('./src/connector/DirectConnector'),
};

module.exports.Engines = {
    RedisStorageEngine: require('./src/storageEngine/RedisStorageEngine'),
};
module.exports.RainCache = Raincache;
module.exports = RainCache;