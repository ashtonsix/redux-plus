'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.storeEnhancer = undefined;

var _redux = require('redux');

var _enhancers = require('./enhancers');

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

var storeEnhancer = (0, _redux.compose)(_enhancers.dispatchEnhancer, _enhancers.selectorEnhancer, _enhancers.effectEnhancer,
// monkey-patch for redux-loop behaviour (effectEnhancer)
(0, _redux.applyMiddleware)(ignoreNull, stringToType));

exports.storeEnhancer = storeEnhancer;