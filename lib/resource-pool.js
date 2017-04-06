'use strict';

var config = require('../config.js'),
    _ = require('lodash');

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
                    throw new Error('Reach max ip address!!!');
                }
            }
        }
    }
    //jshint ignore: end
    return ip;
};

ResourcePool.prototype.nextMac = function() {
    var self = this;
    var buf = self._macGenBuffer.map(function(val) {
        return val.toString(16);
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
                throw new Error('Reach max MAC address!!!');
            }
        }
        else {
            return false;
        }
    });

    return mac;
};

ResourcePool.prototype.start = function() {
};

ResourcePool.prototype.stop = function() {
};

module.exports = new ResourcePool();
