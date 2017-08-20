let RainCache = require('./src/RainCache');
module.exports.RainCache = RainCache;
module.exports = function (...args) {
    return new RainCache(...args);
};
