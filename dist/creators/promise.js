'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.promise = undefined;

var _getModel = require('../helpers/getModel');

var _index = require('../index');

/**
 * An easy way to create promises in reducers
 *
 * promise((state, {payload}) => xr.post('/api/endpoint', payload))
 */

var promise = exports.promise = function promise(promiseGenerator) {
  var reducer = arguments.length <= 1 || arguments[1] === undefined ? _getModel.getModel : arguments[1];
  return function (state, action) {
    var effect = function effect() {
      return Promise.resolve(promiseGenerator(state, action)).then(function (success) {
        return { type: action.type + '_SUCCESS', payload: success, meta: { success: success } };
      }, function (failure) {
        return { type: action.type + '_FAILURE', payload: failure };
      });
    };
    return (0, _index.createEffect)(reducer(state, action), effect);
  };
};