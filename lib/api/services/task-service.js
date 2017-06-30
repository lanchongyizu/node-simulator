'use strict';

var waterlineService = require('./waterline-service');

function TaskService() {
}

TaskService.prototype.getTaskResultById = function(taskId) {
    return waterlineService.tasks.findOne({id: taskId}).populate('taskrunners');
};

module.exports = new TaskService();
