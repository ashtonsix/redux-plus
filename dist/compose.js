'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compose = undefined;

var _redux = require('redux');

var compose = exports.compose = function compose() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var storeEnhancer = _redux.compose.apply(undefined, args);
  // flag for createStore
  storeEnhancer.__REDUX_PLUS$isStoreEnhancer = args.some(function (arg) {
    return arg.__REDUX_PLUS$isStoreEnhancer;
  });

  return storeEnhancer;
};