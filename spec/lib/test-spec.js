'use strict';

// This file is just for testing mocha and travis-ci(https://travis-ci.org), it is TO BE DELETED.
// And the code is from http://mochajs.org/#getting-started.
var assert = require('assert');
describe('Array', function() {
  describe('#indexOf()', function() {
      it('should return -1 when the value is not present', function() {
            assert.equal(-1, [1,2,3].indexOf(4));
          });
    });
});
