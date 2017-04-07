'use strict';

var waterlineService = require('./waterline-service'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    uuid = require('node-uuid'),
    logger = require('../../logger'),
    Node = require('../../node'),
    taskManager = require('../../task-manager'),
    TaskRunner = require('../../task-runner'),
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
        //should keep the ip and mac unique
        return waterlineService.nodes.create(nodes);
    });
};

NodeService.prototype.postTaskByNodegroupId = function(nodegroupId, taskName, startDelay, delay) {
    startDelay = startDelay || 0;
    delay = delay || 0;
    return Promise.try(function() {
        return [
            waterlineService.nodes.find({'nodegroupId': nodegroupId}),
            taskManager.getJobsByName(taskName)
        ];
    })
    .spread(function(nodes, jobs) {
        if(_.isEmpty(nodes) || _.isUndefined(jobs)) {
            //TODO
            throw new Error("404");
        }
        //TODO
        //use message queue to process to task
        var nodeDelay = startDelay;
        _.forEach(nodes, function(n) {
            var node = new Node(n.ip, n.mac, taskName, nodeDelay);
            Promise.delay(nodeDelay)
            .then(function() {
                logger.debug(jobs);
                return new TaskRunner(node, jobs).init().start();
            })
            .catch(function(e) {
                logger.error(e.message + '\n' + node.getPrintInfo());
            });
            nodeDelay += delay;
        });
        return {
            message: 'Run task ' + taskName + ' on nodegroup ' + nodegroupId
        };
    });
};

module.exports = new NodeService();
