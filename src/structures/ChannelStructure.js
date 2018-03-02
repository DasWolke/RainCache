const BaseStructure = require('./BaseStructure');

/**
 * Structure used for holding the values of a channel object
 */
class ChannelStructure extends BaseStructure {
    /**
     * Create a new Channel Structure
     * @param id
     * @param data
     * @param cache
     * @type {Channel}
     */
    constructor(id, data, cache) {
        super();
        this.id = id;
        this.cache = cache;
    }
}
