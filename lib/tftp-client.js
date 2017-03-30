'use strict';

var tftp = require('tftp'),
    Promise = require('bluebird');

var tftpGetPromise = function(fileName, localFile, tftpHost, tftpPort) {
    var client = tftp.createClient({
        host: tftpHost,
        port: tftpPort
    });

    return new Promise(function(resolve, reject) {
        client.get(fileName, localFile, {}, function(err) {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
};

module.exports = {
    get: tftpGetPromise
};
