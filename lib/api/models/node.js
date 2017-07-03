'use strict';

var Waterline = require('waterline'),
    uuid = require('node-uuid');

var nodeCollection = Waterline.Collection.extend({
    identity: 'nodes',
    connection: 'mongo',
    migrate: 'safe',
    attributes: {
        id: {
            type: 'string',
            primaryKey: true,
            unique: true,
            defaultsTo: function() {
                return uuid.v4();
            }
        },
        ip: 'string',
        mac: 'string',
        nodegroupId: 'string',
        toJSON: function() {
            var obj = this.toObject();
            obj.nodeId = obj.id;
            delete obj.id;
            delete obj.createdAt;
            delete obj.updatedAt;
            return obj;
        }
    }
});

module.exports = nodeCollection;
