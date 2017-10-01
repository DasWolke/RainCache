module.exports.Connectors = {
    AmqpConnector: require('./src/connector/AmqpConnector'),
    DirectConnector: require('./src/connector/DirectConnector'),
};

module.exports.Engines = {
    RedisStorageEngine: require('./src/storageEngine/RedisStorageEngine'),
};

module.exports.RainCache = require('./src/RainCache');
module.exports = function (...args) {
    return new module.exports.RainCache(...args);
};