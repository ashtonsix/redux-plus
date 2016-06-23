'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.topologicalSort = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function AcyclicError(message) {
  this.name = 'AcyclicError';
  this.message = message;
  this.stack = new Error().stack;
}

var topologicalSort = exports.topologicalSort = function topologicalSort(nodes) {
  var nodeMap = _lodash2.default.fromPairs(nodes.map(function (node) {
    return [node.path, node];
  }));
  var visit = function visit(sortedNodes, currentNode) {
    var path = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    if (currentNode.__status === 'active') {
      throw new AcyclicError('Selector has circular dependency (' + [].concat(_toConsumableArray(path), [currentNode.path]).join(' -> ') + ')');
    }
    if (currentNode.__status === 'inactive') {
      currentNode.__status = 'active';
      // Consider a node to depend on every ascendant of a dependency,
      // this is for dynamic & nested reducers
      sortedNodes = _lodash2.default.flatten(currentNode.selector.dependencies.map(function (key) {
        return key.split('.').map(function (v, i, arr) {
          return arr.slice(0, i + 1);
        }).map(function (v) {
          return v.join('.');
        });
      })).map(function (key) {
        return nodeMap[key];
      }).filter(function (n) {
        return n;
      })
      // path is for easier to debug AcyclicError messages
      .reduce(function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return visit.apply(undefined, args.concat([[].concat(_toConsumableArray(path), [_lodash2.default.toPath(currentNode.path).join('.')])]));
      }, sortedNodes);
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