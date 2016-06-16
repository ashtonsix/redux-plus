'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var dispatchEnhancer = exports.dispatchEnhancer = function dispatchEnhancer(next) {
  return function (reducer) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var store = next.apply(undefined, [reducer].concat(args));
    var _dispatch = store.dispatch;
    store.dispatch = function (action) {
      var payload = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      var newAction = typeof action === 'string' ? { type: action, payload: payload } : action;
      return _dispatch(newAction);
    };
    return store;
  };
};