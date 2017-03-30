'use strict';

var Promise = require('bluebird'),
    config = require('../config.js'),
    redis = require('promise-redis')(function(resolver) {
        return new Promise(resolver);
    });

function RedisClient() {
    this.options = {
        host: config.redisHost || '127.0.0.1',
        port: config.redisPort || 6379
    };
}

RedisClient.prototype.start = function() {
    this.client = redis.createClient(this.options);
    return this;
};

RedisClient.prototype.getInstance = function() {
    return this.client;
};

RedisClient.prototype.stop = function() {
    this.client.quit();
};

module.exports = new RedisClient();
