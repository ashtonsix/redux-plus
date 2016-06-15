'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.storeEnhancer = undefined;

var _redux = require('redux');

var _reduxLoop = require('redux-loop');

// implementing as storeEnhancer is necessary for second argument
var enhanceDispatch = function enhanceDispatch(next) {
  return function (reducer, state) {
    var store = next(reducer, state);
    var _dispatch = store.dispatch;
    store.dispatch = function (action) {
      var payload = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      var newAction = typeof action === 'string' ? { type: action, payload: payload } : action;
      return _dispatch(newAction);
    };
    return store;
  };
};

// prevents redux-loop dispatching invalid actions
var ignoreNull = function ignoreNull() {
  return function (next) {
    return function (action) {
      if (action != null) next(action);
      return action;
    };
  };
};

// fix type strings from redux-loop
var stringToType = function stringToType() {
  return function (next) {
    return function (action) {
      if (typeof action === 'string') action = { type: action, payload: null };
      next(action);
      return action;
    };
  };
};

var storeEnhancer = (0, _redux.compose)(enhanceDispatch, (0, _reduxLoop.install)(), (0, _redux.applyMiddleware)(ignoreNull, stringToType));

// flag for createStore
storeEnhancer.__REDUX_PLUS$isStoreEnhancer = true;

exports.storeEnhancer = storeEnhancer;