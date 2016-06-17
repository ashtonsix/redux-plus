'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectorEnhancer = exports.enhanceReducer = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _reduxLoop = require('redux-loop');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var AcyclicError = function AcyclicError(message) {
  return { message: message };
};
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
      sortedNodes = currentNode.dependsOn.map(function (key) {
        return nodeMap[key];
      }).filter(function (n) {
        return n;
      }).reduce(visit, sortedNodes);
      currentNode.__status = 'complete';
      return [currentNode].concat(sortedNodes);
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
  if (!reducer.selectors) return reducer;
  var selectors = reducer.selectors.map(function (selector) {
    return _extends({}, selector, {
      path: _lodash2.default.toPath(selector.path).join('.'),
      dependsOn: selector.dependsOn.map(function (dependency) {
        dependency = typeof dependency === 'function' ? dependency() : dependency; // TODO: add local/global state arguments
        if (typeof dependency !== 'string') {
          console.error('Dependency must be a string or return a string (' + selector.path + ')');
        }
        return _lodash2.default.toPath(dependency).join('.');
      })
    });
  });

  try {
    selectors = topologicalSort(selectors);
  } catch (e) {
    if (e instanceof AcyclicError) console.error(e.message);else throw e;
  }

  return enhanceReducer(function (state, action) {
    return selectors.reduce(function (newState, _ref2) {
      var path = _ref2.path;
      var selector = _ref2.selector;
      return _lodash2.default.set((0, _reduxLoop.getModel)(newState), path, selector((0, _reduxLoop.getModel)(newState), path));
    }, reducer(state, action));
  });
};

var selectorEnhancer = exports.selectorEnhancer = function selectorEnhancer(createStore) {
  return function (reducer) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return createStore.apply(undefined, [enhanceReducer(reducer)].concat(args));
  };
};