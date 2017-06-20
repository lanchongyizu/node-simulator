'use strict';

function Timer() {
}

Timer.prototype.start = function() {
    this.time = process.hrtime();
};

/**
 * Stops the timer and returns the difference in milliseconds.
 * @return {Number}
 */
Timer.prototype.stop = function() {
    var diff = process.hrtime(this.time);
    return diff[0] * 1000 + (diff[1] / 1000000);
};

module.exports = Timer;
