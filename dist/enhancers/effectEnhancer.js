'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.effectEnhancer = undefined;

var _redux = require('redux');

var _getModel = require('../helpers/getModel');

var _getEffect = require('../helpers/getEffect');

var install = function install(next) {
  return function (reducer, initialState, enhancer) {
    var currentEffect = [];
    var initialModel = (0, _getModel.getModel)(initialState);
    var initialEffect = (0, _getEffect.getEffect)(initialState);


    var enhanceReducer = function enhanceReducer(_reducer) {
      return function (state, action) {
        var result = _reducer(state, action);
        currentEffect = (0, _getEffect.getEffect)(result);
        return (0, _getModel.getModel)(result);
      };
    };

    var store = next(enhanceReducer(reducer), initialModel, enhancer);

    var runEffect = function runEffect(effect) {
      return Promise.all(effect.map(function (e) {
        return Promise.resolve(typeof e === 'function' ? e() : e);
      })).then(function (actions) {
        return actions.forEach(function (a) {
          return a != null && store.dispatch(a);
        });
      });
    };

    var _dispatch = store.dispatch;
    store.dispatch = function () {
      var result = _dispatch.apply(undefined, arguments);
      runEffect(currentEffect);
      currentEffect = [];
      return result;
    };

    var _replaceReducer = store.replaceReducer;
    store.replaceReducer = function (_reducer) {
      return _replaceReducer(enhanceReducer(_reducer));
    };

    runEffect(initialEffect);

    return store;
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

var effectEnhancer = exports.effectEnhancer = (0, _redux.compose)(install, (0, _redux.applyMiddleware)(stringToType));