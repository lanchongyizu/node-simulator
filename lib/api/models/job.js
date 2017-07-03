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
        job: 'json',
        executeTime: 'string',
        taskrunner: {
            model: 'taskrunners'
        },
        toJSON: function() {
            var obj = this.toObject();
            obj.jobId = obj.id;
            delete obj.id;
            delete obj.createdAt;
            delete obj.updatedAt;
            return obj;
        }
    }
});

module.exports = jobCollection;
