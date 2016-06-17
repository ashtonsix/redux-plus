'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.storeEnhancer = undefined;

var _redux = require('redux');

var _enhancers = require('./enhancers');

var storeEnhancer = (0, _redux.compose)(_enhancers.dispatchEnhancer, _enhancers.selectorEnhancer, _enhancers.effectEnhancer);

exports.storeEnhancer = storeEnhancer;