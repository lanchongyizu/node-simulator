'use strict';

var Promise = require('bluebird');

var swaggerController = function(callback) {
    return function(req, res, next) {
        return Promise.try(function() {
            return callback(req, res);
        })
        .then(function(result) {
            res.json(result);
        })
        .catch(function(err) {
            next(err);
        });
    };
};

module.exports = {
    swaggerController: swaggerController
};
