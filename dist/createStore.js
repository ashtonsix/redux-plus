'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStore = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _redux = require('redux');

var _storeEnhancer2 = require('./storeEnhancer');

var _compose = require('./compose');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createStore = exports.createStore = function createStore(reducer, storeEnhancer, options) {
  if (typeof storeEnhancer !== 'function') {
    options = storeEnhancer;
    storeEnhancer = _storeEnhancer2.storeEnhancer;
  }

  if (!storeEnhancer.__REDUX_PLUS$isStoreEnhancer) {
    storeEnhancer = (0, _compose.compose)(_storeEnhancer2.storeEnhancer, storeEnhancer);
  }

  return (0, _redux.createStore)(reducer, _lodash2.default.get(options, 'initialState'), storeEnhancer);
};