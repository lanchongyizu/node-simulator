'use strict'

var winston = require('winston'),
    config = require('../config.js');

var logger = new winston.Logger({
    level: config.logLevel || "info",
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: config.logFile || 'node-simulator.log' })
    ]
});

module.exports = logger;
