'use strict';

var winston = require('winston'),
    moment = require('moment'),
    config = require('../config.js');

var logger = new winston.Logger({
    level: config.logLevel || "info",
    transports: [
        new winston.transports.Console({
            timestamp: function() {
              return moment().format();
            },
            formatter: function(options) {
              return '[' + options.level.toUpperCase() + '] [' +
              options.timestamp() +'] '+
              (options.message ? options.message : '') +
              (options.meta && Object.keys(options.meta).length ? '\n\t'+
               JSON.stringify(options.meta) : '' );
            }
        }),
        new winston.transports.File({ filename: config.logFile || 'node-simulator.log' })
    ]
});

module.exports = logger;
