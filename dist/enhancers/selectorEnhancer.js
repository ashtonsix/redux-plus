'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectorEnhancer = exports.enhanceReducer = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _getModel = require('../helpers/getModel');

var _liftEffects = require('../helpers/liftEffects');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var AcyclicError = function AcyclicError(message) {
  return { message: message };
};
// TODO: to support createDynamicReducer a node is considered to have edge to all parents of nodes it has edges to
// re-sort selectors after evaluating a dynamicReducer. Memoize if possible
var topologicalSort = function topologicalSort(nodes) {
  var nodeMap = _lodash2.default.fromPairs(nodes.map(function (node) {
    return [node.path, node];
  }));
  var visit = function visit(sortedNodes, currentNode) {
    if (currentNode.__status === 'active') {
      throw new AcyclicError('Selector has circular dependency (' + currentNode.path + ')');
    }
    if (currentNode.__status === 'inactive') {
      currentNode.__status = 'active';
      sortedNodes = currentNode.dependencies.map(function (key) {
        return nodeMap[key];
      }).filter(function (n) {
        return n;
      }).reduce(visit, sortedNodes);
      currentNode.__status = 'complete';
      return sortedNodes.concat(currentNode);
    }
    return sortedNodes;
  };

  return nodes.map(function (node) {
    return _extends({}, node, { __status: 'inactive' });
  }).reduce(visit, []).map(function (_ref) {
    var __status = _ref.__status;

    var node = _objectWithoutProperties(_ref, ['__status']);

    return node;
  }); // eslint-disable-line no-unused-vars
};

var enhanceReducer = exports.enhanceReducer = function enhanceReducer(reducer) {
  var depth = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  var selectors = [];
  if (reducer && reducer.meta) {
    reducer.meta.traverse(function (node, path) {
      if (node.selector) selectors.push(_extends({}, node.selector, { path: path }));
    });
  }
  if (!selectors.length) return reducer;

  // TODO: Support dynamic dependency paths
  selectors = topologicalSort(selectors.map(function (selector) {
    return _extends({}, selector, {
      path: _lodash2.default.toPath(selector.path).join('.'),
      dependencies: selector.dependencies.map(function (dependency) {
        return _lodash2.default.toPath(dependency).join('.');
      })
    });
  }));

  return function (state, action) {
    return (0, _liftEffects.liftEffects)(selectors.reduce(function (newState, _ref2) {
      var path = _ref2.path;
      var _reducer = _ref2.reducer;

      var result = _reducer((0, _getModel.getModel)(newState), path);
      path = _lodash2.default.toPath(path).filter(function (v) {
        return v;
      }).join('.');
      return _lodash2.default.set((0, _getModel.getModel)(newState), path, result);
    }, depth ? state : reducer(state, action)));
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