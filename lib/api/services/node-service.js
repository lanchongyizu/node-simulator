'use strict';

var waterlineService = require('./waterline-service'),
    Promise = require('bluebird'),
    Error = require('../errors.js'),
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

NodeService.prototype.getAllNodegroups = function() {
    return waterlineService.nodegroups.find().populate('nodes');
};

NodeService.prototype.postNodegroup = function(count) {
    var nodegroupId;
    return Promise.try(function() {
        return waterlineService.nodegroups.create();
    })
    .then(function(nodegroup) {
        nodegroupId = nodegroup.id;
        return Promise.map(_.range(count), function() {
            return Promise.all([
                resourcePool.nextIp(),
                resourcePool.nextMac()
            ])
            .spread(function(ip, mac) {
                return {
                    ip: ip,
                    mac: mac,
                    nodegroup: nodegroupId
                };
            });
        });
    })
    .then(function(nodes) {
        return waterlineService.nodes.create(nodes);
    })
    .then(function() {
        return waterlineService.nodegroups.find({'id': nodegroupId}).populate('nodes');
    });
};

NodeService.prototype.postTaskByNodegroupId = function(nodegroupId, taskName, startDelay, delay) {
    startDelay = startDelay || 0;
    delay = delay || 0;
    var taskId = uuid.v4();
    return Promise.all([
        waterlineService.nodes.find({'nodegroup': nodegroupId}),
        taskManager.getJobsByName(taskName)
    ])
    .spread(function(nodes, jobs) {
        if(_.isEmpty(nodes)) {
            throw new Error.NotFoundError("Can't find nodes under Node Group " + nodegroupId + ".");
        }
        if(_.isUndefined(jobs)) {
            throw new Error.NotFoundError("Can't find Task " + taskName + ".");
        }
        var nodeDelay = startDelay;
        _.forEach(nodes, function(n) {
            taskQueue.produce({
                nodeId: n.id,
                ip: n.ip,
                mac: n.mac,
                taskName: taskName,
                nodeDelay: nodeDelay,
                taskId: taskId
            });
            nodeDelay += delay;
        });
        return waterlineService.tasks.create({
            id: taskId,
            taskName: taskName,
            nodegroupId: nodegroupId
        });
    });
};

NodeService.prototype.deleteNodegroupById = function(nodegroupId) {
    return waterlineService.nodegroups.find({'id': nodegroupId}).populate('nodes')
    .then(function(nodegroup) {
        if(_.isEmpty(nodegroup)) {
            throw new Error.NotFoundError("Can't find Node Group " + nodegroupId + ".");
        }
        return waterlineService.nodegroups.destroy({'id': nodegroupId})
        .then(function() {
            return waterlineService.nodes.destroy({'nodegroup': nodegroupId});
        })
        .then(function() {
            return nodegroup;
        });
    });
};

NodeService.prototype.getNodegroupById = function(nodegroupId) {
    return waterlineService.nodegroups.find({'id': nodegroupId}).populate('nodes');
};

NodeService.prototype.deleteNodeById = function(nodeId) {
    return waterlineService.nodes.find({'id': nodeId})
    .then(function(node) {
        if(_.isEmpty(node)) {
            throw new Error.NotFoundError("Can't find Node " + nodeId + ".");
        }
        return waterlineService.nodes.destroy({'id': nodeId})
        .then(function() {
            return node;
        });
    });
};

module.exports = new NodeService();
