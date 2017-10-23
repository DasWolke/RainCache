const Raincache = require('./src/RainCache');

function RainCache(...args) {
    return new Raincache(...args);
}

RainCache.Connectors = {
    AmqpConnector: require('./src/connector/AmqpConnector'),
    KafkaConnectorInbound: require('./src/connector/KafkaConnectorInbound'),
    KafkaConnectorOutbound: require('./src/connector/KafkaConnectorOutbound'),
    DirectConnector: require('./src/connector/DirectConnector'),
};

RainCache.Engines = {
    RedisStorageEngine: require('./src/storageEngine/RedisStorageEngine'),
};
module.exports = RainCache;