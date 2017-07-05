'use strict';

var Waterline = require('waterline'),
    uuid = require('node-uuid');

var nodegroupCollection = Waterline.Collection.extend({
    identity: 'nodegroups',
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
        nodes: {
            collection: 'nodes',
            via: 'nodegroup'
        },
        toJSON: function() {
            var obj = this.toObject();
            obj.nodegroupId = obj.id;
            delete obj.id;
            delete obj.createdAt;
            delete obj.updatedAt;
            return obj;
        }
    }
});

module.exports = nodegroupCollection;
