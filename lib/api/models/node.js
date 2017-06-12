'use strict';

var Waterline = require('waterline');

var nodeCollection = Waterline.Collection.extend({
    identity: 'nodes',
    connection: 'mongo',
    migrate: 'safe',
    attributes: {
        ip: 'string',
        mac: 'string',
        nodeId: 'string',
        nodegroupId: 'string'
    }
});

module.exports = nodeCollection;
