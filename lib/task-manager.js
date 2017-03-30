'use strict';

var _ = require('lodash'),
    ejs = require('ejs'),
    Promise = require('bluebird'),
    config = require('../config.js');

var ejsRenderFile = Promise.promisify(ejs.renderFile);

function TaskManager() {
    this.tasks = {};
}

TaskManager.prototype._init = function() {
    var self = this;
    return ejsRenderFile(config.tasksTemplate, {}, {})
    .then(function(data) {
        var dataObj = JSON.parse(data);
        _.forEach(dataObj.tasks, function(task) {
            if( task.name && task.jobs ) {
                self.tasks[task.name] = task.jobs;
            }
        });
    });
};

TaskManager.prototype.getJobsByName = function(name) {
    return this.tasks[name];
};

TaskManager.prototype.start = function() {
    return this._init();
};

var taskManager = new TaskManager();
module.exports = taskManager;
