'use strict';

var waterlineService = require('./waterline-service'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    uuid = require('node-uuid'),
    taskQueue = require('../../task-queue'),
    taskManager = require('../../task-manager'),
    resourcePool = require('../../resource-pool');

function NodeService() {
}

NodeService.prototype.getAllNodes = function() {
    return waterlineService.nodes.find();
};

NodeService.prototype.postNodegroup = function(count) {
    return Promise.try(function() {
        return uuid.v4();
    })
    .then(function(nodegroupId) {
        return Promise.map(_.range(count), function() {
            return Promise.all([
                resourcePool.nextIp(),
                resourcePool.nextMac()
            ])
            .spread(function(ip, mac) {
                return {
                    ip: ip,
                    mac: mac,
                    nodegroupId: nodegroupId
                };
            });
        });
    })
    .then(function(nodes) {
        //TODO
        //should keep the ip and mac unique
        return waterlineService.nodes.create(nodes);
    });
};

NodeService.prototype.postTaskByNodegroupId = function(nodegroupId, taskName, startDelay, delay) {
    startDelay = startDelay || 0;
    delay = delay || 0;
    var taskId = uuid.v4();
    return Promise.all([
        waterlineService.nodes.find({'nodegroupId': nodegroupId}),
        taskManager.getJobsByName(taskName)
    ])
    .spread(function(nodes, jobs) {
        if(_.isEmpty(nodes) || _.isUndefined(jobs)) {
            //TODO
            throw new Error("404");
        }
        var nodeDelay = startDelay;
        _.forEach(nodes, function(n) {
            taskQueue.produce({
                ip: n.ip,
                mac: n.mac,
                taskName: taskName,
                nodeDelay: nodeDelay,
                taskId: taskId
            });
            nodeDelay += delay;
        });
        return waterlineService.tasks.create({
            taskId: taskId,
            taskName: taskName,
            nodegroupId: nodegroupId
        });
    });
};

NodeService.prototype.deleteNodegroupById = function(nodegroupId) {
    return waterlineService.nodes.destroy({'nodegroupId': nodegroupId});
};

NodeService.prototype.getNodegroupById = function(nodegroupId) {
    return waterlineService.nodes.find({'nodegroupId': nodegroupId});
};

NodeService.prototype.deleteNodeById = function(nodeId) {
    return waterlineService.nodes.destroy({'id': nodeId});
};

module.exports = new NodeService();
