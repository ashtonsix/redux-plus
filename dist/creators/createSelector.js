'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createSelector = exports.defaultMemoize = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var defaultMemoize = exports.defaultMemoize = function defaultMemoize(func) {
  var cache = {
    args: undefined,
    result: undefined
  };

  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (!cache.args || args.some(function (v, i) {
      return cache.args[i] !== v;
    })) {
      cache.args = args;
      cache.result = func.apply(undefined, args);
    }
    return cache.result;
  };
};

var createSelector = exports.createSelector = function createSelector() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  var dependencies = args.slice(0, -1);
  var reducer = defaultMemoize(args[args.length - 1]);

  var selector = function selector(state) {
    return state;
  };
  selector.selectors = [{
    path: [], dependsOn: dependencies,
    selector: function selector(globalState, selectorPath) {
      var localState = _lodash2.default.get(globalState, selectorPath);
      var reducerArgs = dependencies.map(function (path) {
        if (typeof path === 'function') path = path(localState, globalState);
        return _lodash2.default.get(globalState, path);
      });
      return reducer.apply(undefined, [localState].concat(_toConsumableArray(reducerArgs)));
    } }];

  return selector;
};