'use strict';

var Promise = require('bluebird'),
    _ = require('lodash'),
    ejs = require('ejs'),
    logger = require('./logger.js');

module.exports = TaskRunner;

function TaskRunner(node, jobs) {
    this.node = node;
    this.jobs = jobs;
}

TaskRunner.prototype.init = function() {
    var self = this;
    return self;
};

TaskRunner.prototype._renderJob = function(job) {
    var self = this;
    var options = {
        delimiter: '?'
    };
    var jobString = JSON.stringify(job);
    logger.debug(self.node.env);
    jobString = ejs.render(jobString, self.node.env, options);
    return JSON.parse(jobString);
}

TaskRunner.prototype._waterfall = function(jobs, index) {
    var self = this;
    var current = index || 0;
    if (current === jobs.length) {
        return Promise.resolve().then(function() {
            logger.debug("_waterfall end");
        });
    }
    var jobPromise = self._getJobPromise(jobs[current]);
    return jobPromise.then(function() {
        return self._waterfall(jobs, current + 1);
    });
};

TaskRunner.prototype._getJobPromise = function(job) {
    var self = this;
    var jobPromise = Promise.delay(job.time);
    if (job.log) {
        jobPromise = jobPromise.then(function() {
            logger.debug(job.log);
        });
    }

    if( job.protocol === 'tftp' ) {
        jobPromise = jobPromise.then(function() {
            var renderedJob = self._renderJob(job);
            return self.node.tftpGet(renderedJob);
        });
    } else if( job.protocol === 'http' ) {
        jobPromise = jobPromise.then(function() {
            var renderedJob = self._renderJob(job);
            return self.node.httpRequest(renderedJob);
        });
    }

    return jobPromise;
};

TaskRunner.prototype.start = function() {
    var self = this;
    logger.debug("TaskRunner start");
    return self._waterfall(self.jobs);
};

TaskRunner.prototype.stop = function() {

};
