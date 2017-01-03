'use strict';

var nodeManager = require('./lib/node-manager.js'),
    taskManager = require('./lib/task-manager.js'),
    logger = require('./lib/logger.js');

taskManager.start()
.then(function() {
    logger.info("Task Manager started");
    return nodeManager.start()
})
.then(function() {
    logger.info("Node Manager started");
})
.catch(function(err) {
    logger.error(err);
    process.exit(-1);
});

