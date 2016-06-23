'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultMemoize = undefined;

var _getModel = require('../getModel');

// TODO: make cache length configurable & accessible
var defaultMemoize = exports.defaultMemoize = function defaultMemoize(func) {
  var cache = {
    args: undefined,
    result: undefined
  };

  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (!cache.args || args.some(function (v, i) {
      return cache.args[i] !== v;
    })) {
      cache.args = args;
      var result = func.apply(undefined, args);
      cache.result = (0, _getModel.getModel)(cache);
      return result;
    }
    return cache.result;
  };
};