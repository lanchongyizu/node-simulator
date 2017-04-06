'use strict';

var controller = require('../helper').swaggerController,
    nodeService = require('../services/node-service');

var getAllNodes = controller(function() {
    return nodeService.getAllNodes();
});

module.exports = {
    getAllNodes: getAllNodes
};
