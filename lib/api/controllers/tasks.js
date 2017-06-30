'use strict';

var controller = require('../helper').swaggerController,
    taskService = require('../services/task-service');

var getTaskResultById = controller(function(req) {
    var taskId = req.swagger.params.taskId.value;
    return taskService.getTaskResultById(taskId);
});
module.exports = {
    getTaskResultById: getTaskResultById
};

