'use strict';

var express = require('express'),
    http = require('http'),
    Promise = require('bluebird'),
    swaggerTools = require('swagger-tools'),
    config = require('./config.js'),
    redisClient = require('./lib/redis-client'),
    waterlineService = require('./lib/api/services/waterline-service'),
    resourcePool = require('./lib/resource-pool'),
    taskManager = require('./lib/task-manager'),
    taskQueue = require('./lib/task-queue.js'),
    logger = require('./lib/logger.js');

var app = express();

var swaggerDoc = require('./lib/api/swagger.json');
var swaggerOptions = {
    controllers: './lib/api/controllers',
    userStubs: process.env.NODE_ENV === 'development' ? true : false
};
var servicePort = config.servicePort || 9000;
Promise.all([
    redisClient.start(),
    waterlineService.start(),
    resourcePool.start(),
    taskQueue.init(),
    taskManager.start()
])
.then(function() {
    swaggerTools.initializeMiddleware(swaggerDoc, function(middleware) {
        app.use(middleware.swaggerMetadata());
        app.use(middleware.swaggerValidator({
            validateResponse: true
        }));
        app.use(middleware.swaggerRouter(swaggerOptions));
        app.use(middleware.swaggerUi());
        http.createServer(app).listen(servicePort, function() {
            logger.info('Node Simulator Service started at Port ' + servicePort);
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
