'use strict';

var waterlineService = require('./waterline-service');

function TaskService() {
}

TaskService.prototype.getTaskResultById = function(taskId) {
    return waterlineService.tasks.findOne({id: taskId}).populate('taskrunners');
};

TaskService.prototype.getTaskrunnerResultById = function(taskrunnerId) {
    return waterlineService.taskrunners.findOne({id: taskrunnerId}).populate('jobs');
};

TaskService.prototype.getJobResultById = function(jobId) {
    return waterlineService.jobs.findOne({id: jobId});
};

module.exports = new TaskService();
