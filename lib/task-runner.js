'use strict';

var Promise = require('bluebird'),
    ejs = require('ejs'),
    _ = require('lodash'),
    utility = require('./utility.js'),
    logger = require('./logger.js');

function TaskRunner(node, jobs) {
    this.node = node;
    this.jobs = jobs;
}

TaskRunner.prototype._renderJob = function(job) {
    var self = this;
    return Promise.try(function() {
        var options = {
            delimiter: '?'
        };
        var jobString = JSON.stringify(job);
        logger.debug(self.node.env);
        jobString = ejs.render(jobString, self.node.env, options);
        return JSON.parse(jobString);
    });
};

TaskRunner.prototype._waterfall = function(jobs, index) {
    var self = this;
    var current = index || 0;
    if (current === jobs.length) {
        return Promise.resolve()
            .then(function() {
                return self.node.saveEnv();
            })
            .then(function() {
                return self.node.getPrintInfo();
            })
            .then(function(nodeInfo) {
                logger.info('Task succeeded:\n' + nodeInfo);
            });
    }
    var jobPromise = self._getJobPromise(jobs[current]);
    return jobPromise.then(function() {
        return self._waterfall(jobs, current + 1);
    });
};

TaskRunner.prototype._getJobPromise = function(job) {
    var self = this;
    var jobPromise = Promise.resolve();
    if(job.randomDelayBefore) {
        jobPromise = Promise.delay(
            _.random(job.randomDelayBefore[0], job.randomDelayBefore[1])
        );
    }
    else if(job.delayBefore) {
        jobPromise = Promise.delay(job.delayBefore);
    }
    if (job.log) {
        jobPromise = jobPromise.then(function() {
            logger.info(job.log);
        });
    }

    if( job.protocol === 'tftp' ) {
        jobPromise = jobPromise.then(function() {
            return self._renderJob(job);
        })
        .then(function(renderedJob) {
            return self.node.tftpGet(renderedJob);
        });
    } else if( job.protocol === 'http' ) {
        jobPromise = jobPromise.then(function() {
            return self._renderJob(job);
        })
        .then(function(renderedJob) {
            return self.node.httpRequest(renderedJob);
        });
    }

    if(job.randomDelayAfter) {
        jobPromise = jobPromise.delay(
            _.random(job.randomDelayAfter[0], job.randomDelayAfter[1])
        );
    }
    else if(job.delayAfter) {
        jobPromise = jobPromise.delay(job.delayAfter);
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

TaskRunner.prototype = utility.timingWrapper(TaskRunner.prototype, 'TaskRunner');

module.exports = TaskRunner;
