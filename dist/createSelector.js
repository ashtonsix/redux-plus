'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createSelector = exports.defaultMemoize = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _getModel = require('./helpers/getModel');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// TODO: make cache length configurable & accessible
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
      var result = func.apply(undefined, args);
      cache.result = (0, _getModel.getModel)(cache);
      return result;
    }
    return cache.result;
  };
};

var createSelector = exports.createSelector = function createSelector() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  var dependencies = args.slice(0, -1);
  var formula = args[args.length - 1];
  var memoizedFormula = defaultMemoize(formula);

  var reducer = function reducer(state) {
    return state;
  };
  var selector = function selector(globalState, selectorPath) {
    var localState = _lodash2.default.get(globalState, selectorPath);
    var formulaArgs = dependencies.map(function (path) {
      if (typeof path === 'function') path = path(localState, globalState);
      return _lodash2.default.get(globalState, path);
    });
    return memoizedFormula.apply(undefined, [localState].concat(_toConsumableArray(formulaArgs)));
  };
  if (formula.selectors) selector.selectors = formula.selectors;
  reducer.selectors = [{ path: [], dependsOn: dependencies, selector: selector }];

  reducer.meta = {
    reducer: reducer, selector: { dependencies: dependencies, reducer: selector },
    children: { '': _lodash2.default.set(_lodash2.default.get(formula, 'meta'), 'parent', reducer.meta) }
  };

  return reducer;
};