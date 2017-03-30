'use strict';

var request = require('request-promise'),
    config = require('../config.js'),
    tftpClient = require('./tftp-client.js'),
    promise = require('bluebird'),
    logger = require('./logger.js'),
    url = require('url'),
    _ = require('lodash'),
    fs = require('fs');

var writeFileAsync = promise.promisify(fs.writeFile);

module.exports = Node;

function Node(ip, mac, task, delay) {
    this.ip = ip;
    this.mac = mac;
    this.task = task;
    this.delay = delay;
    this.env = {
        node: {
            mac: mac,
            ip: ip
        }
    };

    logger.info("Create node with ip = " + this.ip + ", mac = " + this.mac);
}

Node.prototype.httpRequest = function(job) {
    var self = this;
    var requestMethod = job.method || 'GET';
    logger.info('HTTP request ' + requestMethod + ' ' +  job.uri +
                '\n' + self.getPrintInfo());
    var options = {
        uri: job.uri,
        method: requestMethod
    };
    if (job.headers) {
        options.headers = job.headers;
    }
    if (job.body) {
        options.body = job.body;
        options.json = true;
    }

    return request(options).then(function(data) {
        var extractor = job.regularExpressionExtractor;
        if (extractor) {
            logger.debug(extractor);
            var matches = data.match(extractor.regularExpression);
            if (matches) {
                var matchNumber = extractor.matchNumber || 0;
                self.env[extractor.referenceName] = matches[matchNumber];
            }
        }

        if (job.method === 'GET') {
            var pathname = url.parse(job.uri).pathname;
            var filename = _.last(pathname.split('/'));
            if (filename) {
                return writeFileAsync(config.outputDirectory+'/'+filename, data);
            }
        } else if(job.method === 'POST') {
            logger.debug("post end");
        } else if(job.method === 'PUT') {
            logger.debug("put end");
        }
    });
};

Node.prototype.tftpGet = function(job) {
    var self = this;
    logger.info('TFTP request GET ' + job.fileName +
                '\n' + self.getPrintInfo());
    var tftpHost = job.tftpHost || config.tftpHost;
    var tftpPort = job.tftpPort || config.tftpPort;
    return tftpClient.get(job.fileName,
                          config.outputDirectory + '/' + job.fileName,
                          tftpHost,
                          tftpPort);
};

Node.prototype.getPrintInfo = function() {
    return '{\n    ip: ' + this.ip +
        ',\n    mac: ' + this.mac + '\n}';
};
