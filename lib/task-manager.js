'use strict';

var _ = require('lodash'),
    ejs = require('ejs'),
    Promise = require('bluebird'),
    urlJoin = require('url-join'),
    utility = require('./utility.js'),
    config = require('../config.js');

var ejsRenderFile = Promise.promisify(ejs.renderFile);

function TaskManager() {
    this.tasks = {};
}

TaskManager.prototype._preProcessJobs = function(jobs) {
    return _.flatMap(jobs, function(job) {
        if(_.isString(job.basePath) && _.isArray(job.baseNames)) {
            var jobArray = _.map(job.baseNames, function(file) {
                var jobCopy = _.omit(job, [
                    'basePath',
                    'baseNames',
                    'firstDelayBefore',
                    'firstRandomDelayBefore',
                    'lastDelayAfter',
                    'lastRandomDelayAfter'
                ]);
                jobCopy.uri = urlJoin(job.basePath, file);
                return jobCopy;
            });
            var firstJob = _.first(jobArray);
            var lastJob = _.last(jobArray);
            if(job.firstDelayBefore) {
                firstJob.delayBefore = job.firstDelayBefore;
            }
            if(job.firstRandomDelayBefore) {
                firstJob.randomDelayBefore = job.firstRandomDelayBefore;
            }
            if(job.lastDelayAfter) {
                lastJob.delayAfter = job.lastDelayAfter;
            }
            if(job.lastRandomDelayAfter) {
                lastJob.randomDelayAfter = job.lastRandomDelayAfter;
            }
            return jobArray;
        }
        return job;
    });
};

TaskManager.prototype._init = function() {
    var self = this;
    return ejsRenderFile(config.tasksTemplate, {}, {})
    .then(function(data) {
        var dataObj = JSON.parse(data);
        return dataObj.tasks;
    })
    .filter(function(task) {
        if(task.name && task.jobs) {
            return true;
        }
        return false;
    })
    .map(function(task) {
        return self._preProcessJobs(task.jobs)
            .then(function(jobs) {
                self.tasks[task.name] = jobs;
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

TaskManager.prototype = utility.timingWrapper(TaskManager.prototype, 'TaskManager');

module.exports = new TaskManager();
