'use strict';

var Waterline = require('waterline'),
    uuid = require('node-uuid');

var jobCollection = Waterline.Collection.extend({
    identity: 'jobs',
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
        status: 'string',
        description: 'string',
        executeTime: 'stirng',
        taskrunner: {
            model: 'taskrunners'
        }
    }
});

module.exports = jobCollection;
