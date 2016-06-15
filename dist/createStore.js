'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStore = undefined;

var _redux = require('redux');

var _storeEnhancer2 = require('./storeEnhancer');

var _compose = require('./compose');

var createStore = exports.createStore = function createStore(reducer, initialState, storeEnhancer) {
  if (typeof initialState === 'function') {
    storeEnhancer = initialState;
    initialState = undefined;
  }

  storeEnhancer = storeEnhancer || _storeEnhancer2.storeEnhancer;

  if (!storeEnhancer.__REDUX_PLUS$isStoreEnhancer) {
    storeEnhancer = (0, _compose.compose)(_storeEnhancer2.storeEnhancer, storeEnhancer);
  }

  return (0, _redux.createStore)(reducer, initialState, storeEnhancer);
};