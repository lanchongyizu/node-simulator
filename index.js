'use strict';

var express = require('express'),
    http = require('http'),
    swaggerTools = require('swagger-tools'),
    config = require('./config.js'),
    redisClient = require('./lib/redis-client'),
    waterlineService = require('./lib/api/services/waterline-service'),
    logger = require('./lib/logger.js');

var app = express();

var swaggerDoc = require('./lib/api/swagger.json');
var swaggerOptions = {
    controllers: './lib/api/controllers',
    userStubs: process.env.NODE_ENV === 'development' ? true : false
};
var servicePort = config.servicePort || 9000;
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

redisClient.start();
waterlineService.start();
process.on('SIGINT', function() {
    redisClient.stop();
    waterlineService.stop();
    process.exit(1);
});
