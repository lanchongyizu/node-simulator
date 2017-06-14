'use strict';

var amqp = require('amqplib'),
    config = require('../config.js'),
    logger = require('./logger.js');

module.exports = new TaskQueue();

function TaskQueue() {
    this.amqpUri = config.amqpUri || 'amqp://localhost';
    this.queueName = 'node.simulator.task.queue';
}

TaskQueue.prototype.init = function() {
    var self = this;
    return amqp.connect(self.amqpUri)
        .then(function(conn) {
            self.connection = conn;
        });
};

TaskQueue.prototype.produce = function(task) {
    var self = this;
    return self.connection.createChannel()
        .then(function(ch) {
            return ch.assertQueue(self.queueName, {durable: true})
                .then(function() {
                    //TODO serialize task
                    var taskString = JSON.stringify(task);
                    ch.sendToQueue(self.queueName, new Buffer(taskString), {
                        persistent: true
                    });
                    logger.debug("Produce task " + taskString);
                    return ch.close();
                });
        });
};

TaskQueue.prototype.consume = function(callback) {
    var self = this;
    return self.connection.createChannel().then(function(ch) {
      return ch.assertQueue(self.queueName, {durable: true})
      .then(function() {
        logger.debug("Waiting for tasks.");
        var execute = function(task) {
            var taskString = task.content.toString();
            logger.debug("Received task: " + taskString);
            return callback(JSON.parse(taskString))
                .then(function() {
                    logger.debug("Task done: " + taskString);
                    ch.ack(task);
                });
        };
        return ch.consume(self.queueName, execute, {noAck: false});
      });
    });
};

TaskQueue.prototype.close = function() {
    if(this.connection) {
        this.connection.close();
    }
};
