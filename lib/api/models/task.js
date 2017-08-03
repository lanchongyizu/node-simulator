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
        nodeId: 'string',
        taskrunners: {
            collection: 'taskrunners',
            via: 'task'
        },
        toJSON: function() {
            var obj = this.toObject();
            obj.taskId = obj.id;
            delete obj.id;
            delete obj.createdAt;
            delete obj.updatedAt;
            return obj;
        }
    }
});

module.exports = taskCollection;
