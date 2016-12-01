'use strict';

var Node = require('./node.js'),
    _ = require('lodash'),
    TaskRunner = require('./task-runner.js'),
    TaskManager = require('./task-manager.js'),
    Promise = require('bluebird'),
    request = require('request-promise'),
    ejs = require('ejs'),
    config = require('../config.js');

var ejsRenderFile = Promise.promisify(ejs.renderFile);

function NodeManager() {
    this.nodes = [];
    this._ipGenBuffer = config.fakeIpStart;
    this._macGenBuffer = config.fakeMacStart;
}

NodeManager.prototype._nextIp = function() {
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

NodeManager.prototype._nextMac = function() {
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

NodeManager.prototype._init = function() {
    var self = this;
    return ejsRenderFile(config.nodesTemplate, {}, {})
    .then(function(data) {
        var dataObj = JSON.parse(data);
        _.forEach(dataObj.nodes, function(group) {
            var delay = group.startDelay || 0;
            _.forEach(_.range(0, group.count), () => {
                var node = new Node(self._nextIp(), self._nextMac(), group.task, delay);
                self.nodes.push(node);
                delay += group.delay;
            });
        });
    });
};

NodeManager.prototype.start = function() {
    var self = this;
    return self._init()
    .then(function() {
        return Promise.map(self.nodes, function(node) {
            return Promise.delay(node.delay)
            .then(function() {
                var jobs = TaskManager.getJobsByName(node.task);
                //console.log(jobs);
                return new TaskRunner(node, jobs).init().start();
            });
        });
    });
};

NodeManager.prototype.stop = function() {

};

NodeManager.prototype.cleanupNodes = function() {

};

var nodeManager = new NodeManager();
module.exports = nodeManager;
