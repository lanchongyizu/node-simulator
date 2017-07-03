'use strict';

var controller = require('../helper').swaggerController,
    taskService = require('../services/task-service');

var getTaskResultById = controller(function(req) {
    var taskId = req.swagger.params.taskId.value;
    return taskService.getTaskResultById(taskId);
});

var getTaskrunnerResultById = controller(function(req) {
    var taskrunnerId = req.swagger.params.taskrunnerId.value;
    return taskService.getTaskrunnerResultById(taskrunnerId);
});

var getJobResultById = controller(function(req) {
    var jobId = req.swagger.params.jobId.value;
    return taskService.getJobResultById(jobId);
});

module.exports = {
    getTaskResultById: getTaskResultById,
    getTaskrunnerResultById: getTaskrunnerResultById,
    getJobResultById: getJobResultById
};

