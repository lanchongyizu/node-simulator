'use strict';

var controller = require('../helper').swaggerController,
    nodeService = require('../services/node-service');

var postNodegroup = controller(function(req) {
    var count = req.swagger.params.count.value;
    if(count <= 0 || count > 2000) {
        throw new Error('Number between 1 and 2000 is accepted for parameter count.');
    }
    return nodeService.postNodes(count);
});

var postTaskByNodegroupId = controller(function(req) {
    var nodegroupId = req.swagger.params.nodegroupId.value;
    var taskName = req.swagger.params.taskName.value;
    var startDelay = req.swagger.params.body.value.startDelay;
    var delay = req.swagger.params.body.value.delay;
    return nodeService.postTaskByNodegroupId(nodegroupId, taskName, startDelay, delay);
});

var deleteNodegroupById = controller(function(req) {
    var nodegroupId = req.swagger.params.nodegroupId.value;
    return nodeService.deleteNodegroupById(nodegroupId);
});

var getNodegroupById = controller(function(req) {
    var nodegroupId = req.swagger.params.nodegroupId.value;
    return nodeService.getNodegroupById(nodegroupId);
});

module.exports = {
    postNodegroup: postNodegroup,
    postTaskByNodegroupId: postTaskByNodegroupId,
    deleteNodegroupById: deleteNodegroupById,
    getNodegroupById: getNodegroupById
};

