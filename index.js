'use strict';

var express = require('express'),
    http = require('http'),
    Promise = require('bluebird'),
    swaggerTools = require('swagger-tools'),
    config = require('./config.js'),
    waterlineService = require('./lib/api/services/waterline-service'),
    resourcePool = require('./lib/resource-pool'),
    taskManager = require('./lib/task-manager'),
    logger = require('./lib/logger.js');

var app = express();

var swaggerDoc = require('./lib/api/swagger.json');
var swaggerOptions = {
    controllers: './lib/api/controllers',
    userStubs: process.env.NODE_ENV === 'development' ? true : false
};
var servicePort = config.servicePort || 9000;
Promise.all([
    waterlineService.start(),
    resourcePool.start(),
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
    waterlineService.stop();
    resourcePool.stop();
    taskManager.stop();
    process.exit(1);
});
