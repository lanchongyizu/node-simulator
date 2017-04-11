'use strict';

var controller = require('../helper').swaggerController,
    nodeService = require('../services/node-service');

var getAllNodes = controller(function() {
    return nodeService.getAllNodes();
});

var deleteNodeById = controller(function(req) {
    var nodeId = req.swagger.params.nodeId.value;
    return nodeService.deleteNodeById(nodeId);
});

module.exports = {
    getAllNodes: getAllNodes,
    deleteNodeById: deleteNodeById
};
