'use strict';

var Waterline = require('waterline'),
    sailMemoryAdapter = require('sails-memory'),
    sailMongoAdapter = require('sails-mongo'),
    _ = require('lodash'),
    config = require('../../../config'),
    nodeCollection = require('../models/node');

function WaterlineService() {
    this.waterline = new Waterline();
    this.initialized = false;
    this.waterline.loadCollection(nodeCollection);
}

WaterlineService.prototype.initialize = function() {
    var self = this;
    var waterlineConfig = {
        adapters: {
            'memory': sailMemoryAdapter,
            'mongo': sailMongoAdapter
        },
        connections: {
            memory: {
                adapter: 'memory'
            },
            mongo: {
                adapter: 'mongo',
                url: config.mongoUri || 'mongodb://localhost/ns'
            }
        }
    };

    self.waterline.initialize(waterlineConfig, function(err, ontology) {
        if(err) {
            return console.error(err);
        }
        _.forEach(ontology.collections, function(collection, name) {
            self[name] = collection;
        });
        self.ontology = ontology;
    });
};

WaterlineService.prototype.start = function() {
    this.initialize();
};

WaterlineService.prototype.stop = function() {
    this.waterline.teardown();
};

module.exports = new WaterlineService();
