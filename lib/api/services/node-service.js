'use strict';

var waterlineService = require('./waterline-service');

function NodeService() {
}

NodeService.prototype.getAllNodes = function() {
    return waterlineService.nodes.find();
};

module.exports = new NodeService();
