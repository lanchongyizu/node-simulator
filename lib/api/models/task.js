'use strict';

var Waterline = require('waterline');

var taskCollection = Waterline.Collection.extend({
    identity: 'tasks',
    connection: 'mongo',
    migrate: 'safe',
    attributes: {
        taskId: 'string',
        taskName: 'string',
        nodegroupId: 'string'
    }
});

module.exports = taskCollection;
