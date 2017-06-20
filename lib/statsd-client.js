'use strict';

var StatsD = require('node-statsd'),
    util = require('util'),
    os = require('os'),
    config = require('../config.js');

function StatsdClient() {
}

util.inherits(StatsdClient, StatsD.StatsD);

StatsdClient.prototype.start = function() {
    var host = os.hostname().split(/\./)[0];
    StatsdClient.super_.call(this, {
        host: config.statsdHost,
        port: config.statsdPort,
        prefix: 'node_simulator.' + host + '.',
        suffix: ''
    });
    this.started = true;
};

StatsdClient.prototype.stop = function() {
    if(this.started) {
        this.close();
    }
};

module.exports = new StatsdClient();
