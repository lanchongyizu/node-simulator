'use strict';

var winston = require('winston'),
    moment = require('moment'),
    config = require('../config.js');

var logTimestamp = function() {
    return moment().format();
};

var logFormatter = function(options) {
  return '[' + options.level.toUpperCase() + '] [' +
      options.timestamp() +'] '+ (options.message ? options.message : '');
};

var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: config.logConsoleLevel || 'info',
            timestamp: logTimestamp,
            formatter: logFormatter
        }),
        new winston.transports.File({
            level: config.logFileLevel || 'info',
            filename: config.logFile || 'node-simulator.log',
            json: false,
            maxsize: config.logFileMaxSize || 1048576,
            timestamp: logTimestamp,
            formatter: logFormatter
        })
    ]
});

module.exports = logger;
