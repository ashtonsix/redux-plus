'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wait = undefined;

var _index = require('../index');

var wait = exports.wait = function wait(delay, func) {
  return function (state, action) {
    return (0, _index.createEffect)(state, function () {
      return new Promise(function (resolve) {
        return setTimeout(function () {
          return resolve(func(state, action));
        }, delay);
      });
    });
  };
}; /*
   Example:
   createReducer({
     INCREMENT: state => state + 1
     INCREMENT_IN_5_SECONDS: wait(5000, () => 'INCREMENT')
   })
    */