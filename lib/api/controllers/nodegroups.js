'use strict';

var controller = require('../helper').swaggerController,
    nodeService = require('../services/node-service');

var getAllNodegroups = controller(function() {
    return nodeService.getAllNodegroups();
});

var postNodegroup = controller(function(req) {
    var count = req.swagger.params.count.value;
    return nodeService.postNodegroup(count);
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
    getAllNodegroups: getAllNodegroups,
    postNodegroup: postNodegroup,
    postTaskByNodegroupId: postTaskByNodegroupId,
    deleteNodegroupById: deleteNodegroupById,
    getNodegroupById: getNodegroupById
};

