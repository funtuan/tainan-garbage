const LRU = require('lru-cache');
const cache = new LRU();

module.exports = cache;
