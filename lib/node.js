'use strict';

var request = require('request-promise'),
    config = require('../config.js'),
    tftpClient = require('./tftp-client.js'),
    waterlineService = require('./api/services/waterline-service'),
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
}

Node.prototype.loadEnv = function() {
    var self = this;
    return waterlineService.nodes.findOne({mac: self.mac})
    .then(function(node) {
        self.env = _.defaultsDeep(self.env, node.env);
    });
};

Node.prototype.saveEnv = function() {
    var self = this;
    return waterlineService.nodes.update({mac: self.mac}, {env: self.env});
};

Node.prototype.httpRequest = function(job, retry) {
    var self = this;
    retry = retry || 0;
    var requestMethod = job.method || 'GET';
    var logInfo = 'HTTP ' + requestMethod + ' ' +  job.uri +
                '\n' + self.getPrintInfo();
    if(retry > 0) {
        logInfo = 'Retry ' + retry + ': ' + logInfo;
    }
    logger.info(logInfo);
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
            if (filename && job.saveFile) {
                return writeFileAsync(config.outputDirectory+'/'+filename, data);
            }
        } else if(job.method === 'POST') {
            logger.debug("post end");
        } else if(job.method === 'PUT') {
            logger.debug("put end");
        }
    })
    .catch(function(err) {
        if(job.ignoreFailure) {
            logger.debug(err);
        }
        else if((job.retry === -1) ||
                (job.retry > 0 && retry < job.retry)) {
            return self.httpRequest(job, retry + 1);
        }
        else {
            throw err;
        }
    });
};

Node.prototype.tftpGet = function(job, retry) {
    var self = this;
    retry = retry || 0;
    var logInfo = 'TFTP GET ' + job.fileName +
                '\n' + self.getPrintInfo();
    if(retry > 0) {
        logInfo = 'Retry ' + retry + ': ' + logInfo;
    }
    logger.info(logInfo);
    var tftpHost = job.tftpHost || config.tftpHost;
    var tftpPort = job.tftpPort || config.tftpPort;
    return tftpClient.get(job.fileName,
                          config.outputDirectory + '/' + job.fileName,
                          tftpHost,
                          tftpPort)
    .catch(function(err) {
        if(job.ignoreFailure) {
            logger.debug(err);
        }
        else if((job.retry === -1) ||
                (job.retry > 0 && retry < job.retry)) {
            return self.tftpGet(job, retry + 1);
        }
        else {
            throw err;
        }
    });
};

Node.prototype.getPrintInfo = function() {
    return '{\n    ip: ' + this.ip +
        ',\n    mac: ' + this.mac + '\n}';
};
