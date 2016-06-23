'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectorEnhancer = exports.enhanceReducer = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // Psyche! selectorEnhancer is also the dynamicReducerEnhancer.
// They are coupled very tightly so implemented together.

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _getModel = require('../helpers/getModel');

var _liftEffects = require('../helpers/liftEffects');

var _addMetadata = require('../helpers/addMetadata');

var _reduceInteruptable = require('../helpers/reduceInteruptable');

var _topologicalSort = require('../helpers/topologicalSort');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var enhanceReducer = exports.enhanceReducer = function enhanceReducer(reducer) {
  var depth = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  if (!reducer.meta) (0, _addMetadata.addMetadata)(reducer);
  var selectors = [];
  var dynamicReducers = [];
  reducer.meta.traverse(function (node, path) {
    if (node.selector) selectors.push(_extends({}, node, { path: path }));else if (node.isDynamic || node.isGenerated) dynamicReducers.push(_extends({}, node, { path: path }));
  });

  selectors = (0, _topologicalSort.topologicalSort)(selectors);
  var nodes = dynamicReducers.concat(selectors);
  if (!nodes.length) return reducer;

  return function (state, action) {
    var result = (0, _reduceInteruptable.reduceInteruptable)(nodes, function (newState, node, i, a, interupt) {
      // ignored nodes have already been applied to state
      if (node.ignore) return newState;

      var _result = node.selector ? node.selector.reducer((0, _getModel.getModel)(newState), node.path) : node.reducer(reducer.meta.get((0, _getModel.getModel)(newState), node.path), action);

      if (node.isDynamic) {
        var newReducer = { meta: _lodash2.default.cloneDeep(reducer.meta) };
        _result.meta.isGenerated = true;
        newReducer = (0, _addMetadata.replaceNode)(reducer, node.path, _result);
        interupt(enhanceReducer(newReducer, depth + 1)(newState, action));
      }

      node.ignore = true;
      return reducer.meta.set((0, _getModel.getModel)(newState), node.path, _result);
    }, depth ? state : reducer(state, action));
    if (!depth) {
      nodes.forEach(function (node) {
        return delete node.ignore;
      });
      result = (0, _liftEffects.liftEffects)(result);
    }
    return result;
  };
};

var selectorEnhancer = exports.selectorEnhancer = function selectorEnhancer(createStore) {
  return function (reducer) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return createStore.apply(undefined, [enhanceReducer(reducer)].concat(args));
  };
};