'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStore = undefined;

var _redux = require('redux');

var _storeEnhancer2 = require('./storeEnhancer');

var createStore = exports.createStore = function createStore(reducer, initialState, storeEnhancer) {
  if (typeof initialState === 'function') {
    storeEnhancer = initialState;
    initialState = undefined;
  }

  return (0, _redux.createStore)(reducer, initialState, storeEnhancer || _storeEnhancer2.storeEnhancer);
};