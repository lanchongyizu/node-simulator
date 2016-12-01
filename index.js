'use strict';

var nodeManager = require('./lib/node-manager.js'),
    taskManager = require('./lib/task-manager.js');

taskManager.start()
.then(function() {
    return nodeManager.start()
})
.then(function() {
    process.exit(0);
})
.catch(function(err) {
    console.error(err);
    process.exit(-1);
});

