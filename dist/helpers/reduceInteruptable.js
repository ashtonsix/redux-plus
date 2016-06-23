'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
function ReduceError(message) {
  this.name = 'ReduceError';
  this.message = message || 'Default Message';
  this.stack = new Error().stack;
}

var reduceInteruptable = exports.reduceInteruptable = function reduceInteruptable(arr, f, initialValue) {
  var val = initialValue;
  var interupt = function interupt(_val) {
    val = _val;
    throw new ReduceError();
  };

  try {
    val = arr.reduce(function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return f.apply(undefined, args.concat([interupt]));
    }, val);
  } catch (e) {
    if (e instanceof ReduceError) return val;else throw e; // eslint-disable-line no-else-return
  }

  return val;
};