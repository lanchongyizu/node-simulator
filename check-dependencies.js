'use strict';

var Promise = require('bluebird'),
    redisClient = require('./lib/redis-client'),
    waterlineService = require('./lib/api/services/waterline-service'),
    taskQueue = require('./lib/task-queue.js');

return Promise.all([
    redisClient.start(),
    waterlineService.start(),
    taskQueue.start()
])
.catch(function(e) {
    console.log(e);
    process.exit(1);
})
.finally(function() {
    process.exit(0);
});
