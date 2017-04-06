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
    return nodeService.postTaskByNodegroupId(nodegroupId, taskName);
});

module.exports = {
    postNodegroup: postNodegroup,
    postTaskByNodegroupId: postTaskByNodegroupId
};
