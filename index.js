'use strict';

var nodeManager = require('./lib/node-manager.js'),
    taskManager = require('./lib/task-manager.js'),
    logger = require('./lib/logger.js');

taskManager.start()
.then(function() {
    return nodeManager.start()
})
.then(function() {
    process.exit(0);
})
.catch(function(err) {
    logger.error(err);
    process.exit(-1);
});

