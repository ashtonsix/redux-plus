'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.effectEnhancer = undefined;

var _getModel = require('../helpers/getModel');

var _getGenerators = require('../helpers/getGenerators');

var effectEnhancer = exports.effectEnhancer = function effectEnhancer(next) {
  return function (reducer, initialState, enhancer) {
    var currentGenerators = [];
    var initialModel = (0, _getModel.getModel)(initialState);
    var initialGenerators = (0, _getGenerators.getGenerators)(initialState);


    var enhanceReducer = function enhanceReducer(_reducer) {
      return function (state, action) {
        var result = _reducer(state, action);
        currentGenerators = (0, _getGenerators.getGenerators)(result);
        return (0, _getModel.getModel)(result);
      };
    };

    var store = next(enhanceReducer(reducer), initialModel, enhancer);

    var runEffect = function runEffect(generators) {
      return Promise.all(generators.map(function (g) {
        return new Promise(function (resolve) {
          return resolve(typeof g === 'function' ? g() : g);
        }).catch(function (e) {
          // TODO: include node path that returned generator
          console.error('error while running generator');
          throw e;
        });
      })).then(function (actions) {
        return actions.forEach(function (a) {
          return a != null && store.dispatch(a);
        });
      });
    };

    var _dispatch = store.dispatch;
    store.dispatch = function () {
      var result = _dispatch.apply(undefined, arguments);
      runEffect(currentGenerators);
      currentGenerators = [];
      return result;
    };

    var _replaceReducer = store.replaceReducer;
    store.replaceReducer = function (_reducer) {
      return _replaceReducer(enhanceReducer(_reducer));
    };

    runEffect(initialGenerators);

    return store;
  };
};