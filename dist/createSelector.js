'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createSelector = undefined;

var _addMetadata = require('./helpers/addMetadata');

var _memoize = require('./helpers/memoize');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var createSelector = exports.createSelector = function createSelector() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var dependencies = args.slice(0, -1);
  var formula = args[args.length - 1];
  var memoizedFormula = (0, _memoize.defaultMemoize)(formula);

  var reducer = function reducer(state) {
    return state;
  };
  var selector = function selector(globalState, selectorPath) {
    return memoizedFormula.apply(undefined, [reducer.meta.get(globalState, selectorPath)].concat(_toConsumableArray(dependencies.map(function (path) {
      return reducer.meta.get(globalState, path);
    }))));
  };

  (0, _addMetadata.addMetadata)(reducer, { '': formula });
  reducer.meta.selector = { dependencies: dependencies, reducer: selector };

  return reducer;
};