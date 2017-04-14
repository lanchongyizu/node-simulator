'use strict';

var _ = require('lodash'),
    ejs = require('ejs'),
    Promise = require('bluebird'),
    urlJoin = require('url-join'),
    config = require('../config.js');

var ejsRenderFile = Promise.promisify(ejs.renderFile);

function TaskManager() {
    this.tasks = {};
}

TaskManager.prototype._preProcessJobs = function(jobs) {
    return _.flatMap(jobs, function(job) {
        if(_.isString(job.basePath) && _.isArray(job.baseNames)) {
            return _.map(job.baseNames, function(file) {
                var jobCopy = _.clone(job);
                jobCopy.uri = urlJoin(job.basePath, file);
                return jobCopy;
            });
        }
        return job;
    });
};

TaskManager.prototype._init = function() {
    var self = this;
    return ejsRenderFile(config.tasksTemplate, {}, {})
    .then(function(data) {
        var dataObj = JSON.parse(data);
        _.forEach(dataObj.tasks, function(task) {
            if( task.name && task.jobs ) {
                self.tasks[task.name] = self._preProcessJobs(task.jobs);
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

TaskManager.prototype.stop = function() {
};

var taskManager = new TaskManager();
module.exports = taskManager;
