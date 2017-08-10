'use strict';

var controller = require('../helper').swaggerController,
    nodeService = require('../services/node-service'),
    Error = require('../errors.js'),
    webhook = require('../../../config.js').webhook,
    _ = require('lodash');

var getAllNodes = controller(function() {
    return nodeService.getAllNodes();
});

var deleteNodeById = controller(function(req) {
    var nodeId = req.swagger.params.nodeId.value;
    return nodeService.deleteNodeById(nodeId);
});

var postTaskByContextNodeId = controller(function(req) {
    var nodeId = _.get(req.swagger.params.body.value, webhook.contextNodeId);
    var originalTaskName = _.get(req.swagger.params.body.value, webhook.taskName);
    var taskName = webhook.taskMappings[originalTaskName];
    if(_.isUndefined(taskName)) {
        throw new Error.NotFoundError("Can't map " + originalTaskName + " to any Task.");
    }
    return nodeService.postTaskByContextNodeId(nodeId, taskName);
});

module.exports = {
    getAllNodes: getAllNodes,
    deleteNodeById: deleteNodeById,
    postTaskByContextNodeId: postTaskByContextNodeId
};
