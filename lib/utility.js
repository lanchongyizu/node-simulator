'use strict';

var Timer = require('./timer.js'),
    _ = require('lodash'),
    Error = require('./api/errors.js'),
    statsdClient = require('./statsd-client.js');

function timingWrapper(cls, clsName) {
    return  _.mapValues(cls, function(func, funcName) {
        return function() {
            var timer = new Timer();
            var args = arguments;
            var self = this;
            return Promise.resolve()
            .then(function() {
                timer.start();
                return func.apply(self, args);
            })
            .then(function(result) {
                statsdClient.timing(clsName + '.' + funcName, timer.stop());
                return result;
            });
        };
    });
}

function errorHandler(err, req, res, next) {
    if(err instanceof Error.BaseError) {
        res.status(err.status);
        return res.json({
            status: err.status,
            message: err.message
        });
    }
    else if(err.failedValidation) {
        res.status(400);
        return res.json({
            status: 400,
            message: err.message
        });
    }
    else {
        res.status(500);
        res.json({
            status: 500,
            message: "Internal Error."
        });
        next(err);
    }
}

module.exports = {
    timingWrapper: timingWrapper,
    errorHandler: errorHandler
};
