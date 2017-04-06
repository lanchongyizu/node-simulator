'use strict';

var waterlineService = require('./waterline-service'),
    Promise = require('bluebird'),
    uuid = require('node-uuid'),
    taskManager = require('../../task-manager'),
    resourcePool = require('../../resource-pool');

function NodeService() {
}

NodeService.prototype.getAllNodes = function() {
    return waterlineService.nodes.find();
};

NodeService.prototype.postNodes = function(count) {
    var nodes = [];
    return Promise.try(function() {
        return uuid.v4();
    })
    .then(function(nodegroupId) {
        for(var i = 0; i < count; ++i) {
            var ip = resourcePool.nextIp();
            var mac = resourcePool.nextMac();
            nodes.push({
                ip: ip,
                mac: mac,
                nodegroupId: nodegroupId
            });
        }
        return nodes;
    })
    .then(function(nodes) {
        //TODO
        return waterlineService.nodes.create(nodes);
    });
};

NodeService.prototype.postTaskByNodegroupId = function(nodegroupId, taskName) {
    return Promise.try(function() {
        return [
            waterlineService.nodes.find({'nodegroupId': nodegroupId}),
            taskManager.getJobsByName(taskName)
        ];
    })
    .spread(function(nodes, jobs) {
        //TODO
        return {
            message: 'Run task ' + taskName + ' on nodegroup ' + nodegroupId
        };
    });
};

module.exports = new NodeService();
