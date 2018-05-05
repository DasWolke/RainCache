/**
 * A base class for providing methods to all structures that extend from it
 */
class BaseStructure {
    /**
     * Creates a new BaseStructure
     * @param {String} id - id of the structure
     * @param {Object} data - an object containing data that is assigned to the structure
     * @param {BaseCache} cache - a Cache that extends from a BaseCache instance, allows you to access the cache this object originated from
     */
    constructor(id, data, cache) {
        this.id = id;
        /**
         * Cache instance where this structure originated from
         * @type {BaseCache}
         */
        this.cache = cache;
        data = data || {};
        Object.assign(this, data);
    }
}

module.exports = BaseStructure;
