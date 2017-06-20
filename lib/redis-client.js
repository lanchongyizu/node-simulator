'use strict';

var Promise = require('bluebird'),
    config = require('../config.js'),
    utility = require('./utility.js'),
    redis = require('promise-redis')(function(resolver) {
        return new Promise(resolver);
    });

function RedisClient() {
    this.options = {
        host: config.redisHost || '127.0.0.1',
        port: config.redisPort || 6379
    };
    this.running = false;
}

RedisClient.prototype.start = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        if(!self.running) {
            self.client = redis.createClient(self.options);
            self.client.on('error', function(err) {
                reject(err);
            });
            self.client.on('ready', function() {
                self.running = true;
                resolve();
            });
        }
    });
};

RedisClient.prototype.getInstance = function() {
    return this.client;
};

RedisClient.prototype.stop = function() {
    if(this.running) {
        this.running = false;
        this.client.quit();
    }
    return this;
};

RedisClient.prototype = utility.timingWrapper(RedisClient.prototype, 'RedisClient');

module.exports = new RedisClient();
