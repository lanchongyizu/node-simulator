'use strict';

var Promise = require('bluebird'),
    redisClient = require('./lib/redis-client'),
    waterlineService = require('./lib/api/services/waterline-service'),
    resourcePool = require('./lib/resource-pool'),
    taskManager = require('./lib/task-manager'),
    taskQueue = require('./lib/task-queue.js'),
    Node = require('./lib/node'),
    TaskRunner = require('./lib/task-runner'),
    logger = require('./lib/logger.js');

Promise.all([
    redisClient.start(),
    waterlineService.start(),
    resourcePool.start(),
    taskQueue.init(),
    taskManager.start()
])
.then(function() {
    logger.info('Node Simulator Task Runner started.');
    return taskQueue.consume(function(task) {
        var node = new Node(task.ip, task.mac, task.taskName, task.nodeDelay);
        return Promise.delay(task.nodeDelay)
        .then(function() {
            return node.loadEnv();
        })
        .then(function() {
            return taskManager.getJobsByName(task.taskName);
        })
        .then(function(jobs) {
            logger.debug(jobs);
            return new TaskRunner(node, jobs).init().start();
        })
        .catch(function(e) {
            logger.error(e.message + '\n' + node.getPrintInfo());
        });
    });
});

process.on('SIGINT', function() {
    redisClient.stop();
    waterlineService.stop();
    resourcePool.stop();
    taskQueue.close();
    taskManager.stop();
    process.exit(1);
});
