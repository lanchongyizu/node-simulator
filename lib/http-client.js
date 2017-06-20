'use strict';

var http = require('http'),
    _ = require('lodash'),
    utility = require('./utility.js'),
    Promise = require('bluebird');

var httpRequestPromise = function(options, body, responsed) {
    return new Promise(function(resolve, reject) {
        var rawData = '';
        if (body) {
            body = JSON.stringify(body);
            options.headers = _.defaults(options.headers, {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            });
        }
        var req = http.request(options, function(res) {
            if(res.statusCode >= 400) {
                reject(new Error("HTTP Error: " + res.statusCode));
            }
            res.on('data', function(chunk) {
                if(responsed) {
                    rawData += chunk;
                }
            });
            res.on('end', function() {
                if(responsed) {
                    resolve(rawData);
                }
                else {
                    resolve();
                }
            });
            res.on('err', function(err) {
                reject(err);
            });
        });
        req.on('error', function(err) {
            reject(err);
        });
        if(body) {
            req.write(body);
        }
        req.end();
    });
};

module.exports = utility.timingWrapper({
    request: httpRequestPromise
}, 'HttpClient');
