'use strict';

var Waterline = require('waterline'),
    sailMemoryAdapter = require('sails-memory'),
    sailMongoAdapter = require('sails-mongo'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    config = require('../../../config'),
    fs = require('fs');

var MODELDIR = __dirname + '/../models/';
var readdir = Promise.promisify(fs.readdir);

function WaterlineService() {
    this.waterline = new Waterline();
    this.initialized = false;
}

WaterlineService.prototype.loadCollection = function() {
    var self = this;
    return readdir(MODELDIR)
    .filter(function(file) {
        return _.endsWith(file, '.js');
    })
    .map(function(file) {
        return require(MODELDIR + file);
    })
    .map(function(collection) {
        return self.waterline.loadCollection(collection);
    });
};

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

    return self.waterline.initialize(waterlineConfig, function(err, ontology) {
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
    var self = this;
    return self.loadCollection()
    .then(function() {
        return self.initialize();
    });
};

WaterlineService.prototype.stop = function() {
    this.waterline.teardown();
};

module.exports = new WaterlineService();
