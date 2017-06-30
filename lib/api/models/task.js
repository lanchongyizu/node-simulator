'use strict';

var Waterline = require('waterline'),
    uuid = require('node-uuid');

var taskCollection = Waterline.Collection.extend({
    identity: 'tasks',
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
        taskName: 'string',
        nodegroupId: 'string',
        taskrunners: {
            collection: 'taskrunners',
            via: 'task'
        }
    }
});

module.exports = taskCollection;
