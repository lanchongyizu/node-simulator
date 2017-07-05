'use strict';

var Promise = require('bluebird'),
    Error = require('./errors.js');

function errorHanlder(err, res, next) {
    if(err instanceof Error.BaseError) {
        res.status(err.status);
        return res.json({
            status: err.status,
            message: err.message
        });
    }
    next(err);
}

var swaggerController = function(callback) {
    return function(req, res, next) {
        return Promise.try(function() {
            return callback(req, res);
        })
        .then(function(result) {
            res.json(result);
        })
        .catch(function(err) {
            errorHanlder(err, res, next);
        });
    };
};

module.exports = {
    swaggerController: swaggerController
};
