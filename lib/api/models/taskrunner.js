'use strict';

var Waterline = require('waterline'),
    uuid = require('node-uuid');

var taskrunnerCollection = Waterline.Collection.extend({
    identity: 'taskrunners',
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
        nodeId: 'string',
        task: {
            model: 'tasks'
        },
        status: 'string',
        description: 'string',
        jobs: {
            collection: 'jobs',
            via: 'taskrunner'
        }
    }
});

module.exports = taskrunnerCollection;
