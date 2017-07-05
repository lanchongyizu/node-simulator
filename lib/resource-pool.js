'use strict';

var config = require('../config.js'),
    waterlineService = require('./api/services/waterline-service'),
    utility = require('./utility.js'),
    Promise = require('bluebird'),
    Error = require('./api/errors.js'),
    logger = require('./logger.js'),
    redisClient = require('./redis-client.js'),
    _ = require('lodash');

var IPKEY = 'node-simulator:ips';
var MACKEY = 'node-simulator:macs';

function ResourcePool() {
    this._ipGenBuffer = config.fakeIpStart;
    this._macGenBuffer = config.fakeMacStart;
}

ResourcePool.prototype.nextIp = function() {
    var self = this;
    var ip = self._ipGenBuffer.join('.');
    //jshint ignore: start
    if (++self._ipGenBuffer[3] >= 255) {
        self._ipGenBuffer[3] = 2;
        if (++self._ipGenBuffer[2] >= 256) {
            self._ipGenBuffer[2] = 1;
            if (++self._ipGenBuffer[1] >= 256) {
                self._ipGenBuffer[1] = 1;
                if (++self._ipGenBuffer[0] >= 256) {
                    throw new Error.BadRequestError("Reach maximum ip address.");
                }
            }
        }
    }
    //jshint ignore: end
    return redisClient.SISMEMBER(IPKEY, ip)
    .then(function(result) {
        logger.debug('ip:' + result);
        if(result) {
            return self.nextIp();
        }
        return redisClient.SADD(IPKEY, ip)
        .then(function() {
            return ip;
        });
    });
};

ResourcePool.prototype.nextMac = function() {
    var self = this;
    var buf = self._macGenBuffer.map(function(val) {
        val = val.toString(16);
        if (val.length === 1) {
            val = "0" + val;
        }
        return val;
    });
    var mac = buf.join(':');

    self._macGenBuffer[5] += 1;
    _.forEachRight(self._macGenBuffer, function(val, index) {
        if (self._macGenBuffer[index] > 255) {
            if (index >= 1) {
                self._macGenBuffer[index-1] += 1;
                self._macGenBuffer[index] -= 255;
            }
            else {
                throw new Error.BadRequestError("Reach maximum MAC address.");
            }
        }
        else {
            return false;
        }
    });

    return redisClient.SISMEMBER(MACKEY, mac)
    .then(function(result) {
        logger.debug('mac:' + result);
        if(result) {
            return self.nextMac();
        }
        return redisClient.SADD(MACKEY, mac)
        .then(function() {
            return mac;
        });
    });
};

ResourcePool.prototype.start = function() {
    return Promise.all([
        redisClient.DEL(IPKEY),
        redisClient.DEL(MACKEY)
    ])
    .then(function() {
        return waterlineService.nodes.find();
    })
    .map(function(node) {
        return Promise.all([
            redisClient.SADD(IPKEY, node.ip),
            redisClient.SADD(MACKEY, node.mac)
        ]);
    });
};

ResourcePool.prototype.stop = function() {
};

ResourcePool.prototype = utility.timingWrapper(ResourcePool.prototype, 'ResourcePool');

module.exports = new ResourcePool();
