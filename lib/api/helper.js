'use strict';

var Promise = require('bluebird'),
    Timer = require('../timer.js'),
    logger = require('../logger.js');

//TODO: add uuid for request
var swaggerController = function(callback) {
    return function(req, res, next) {
        var timer = new Timer();
        timer.start();
        return Promise.try(function() {
            return callback(req, res);
        })
        .then(function(result) {
            logger.info('HTTP ' + req.method + ' ' +
                        res.statusCode + ' ' +
                        timer.stop().toFixed(3) + ' ' +
                        req.originalUrl);
            res.json(result);
        })
        .catch(function(err) {
            logger.info('HTTP ' + req.method + ' ' +
                        err.status + ' ' +
                        timer.stop().toFixed(3) + ' ' +
                        req.originalUrl + '\n'+
                        JSON.stringify(err));
            next(err);
        });
    };
};

module.exports = {
    swaggerController: swaggerController
};
