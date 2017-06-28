'use strict';

var Promise = require('bluebird'),
    config = require('../config.js'),
    utility = require('./utility.js'),
    _ = require('lodash'),
    redisCmds = require('redis-commands').list,
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
            self.redisClient = redis.createClient(self.options);
            _.forEach(redisCmds, function(fullCommand) {
                var cmd = fullCommand.split(' ')[0];
                self[cmd] = _.bind(self.redisClient[cmd], self.redisClient);
                self[cmd.toUpperCase()] = self[cmd];
            });
            self.redisClient.on('error', function(err) {
                reject(err);
            });
            self.redisClient.on('ready', function() {
                self.running = true;
                resolve();
            });
        }
    });
};

RedisClient.prototype.stop = function() {
    if(this.running) {
        this.running = false;
        this.redisClient.quit();
    }
    return this;
};

RedisClient.prototype = utility.timingWrapper(RedisClient.prototype, 'RedisClient');

module.exports = new RedisClient();
