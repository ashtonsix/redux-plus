'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.effectEnhancer = undefined;

var _redux = require('redux');

var _reduxLoop = require('redux-loop');

var ignoreNull = function ignoreNull() {
  return function (next) {
    return function (action) {
      if (action != null) next(action);
      return action;
    };
  };
};

var stringToType = function stringToType() {
  return function (next) {
    return function (action) {
      if (typeof action === 'string') action = { type: action, payload: null };
      next(action);
      return action;
    };
  };
};

var effectEnhancer = exports.effectEnhancer = (0, _redux.compose)((0, _reduxLoop.install)(),
// monkey-patch for redux-loop behaviour (effectEnhancer)
(0, _redux.applyMiddleware)(ignoreNull, stringToType));