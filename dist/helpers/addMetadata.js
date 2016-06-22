'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addMetadata = exports.defaultSetter = exports.defaultGetter = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var defaultGetter = exports.defaultGetter = function defaultGetter(state, key) {
  return state[key];
};
var defaultSetter = exports.defaultSetter = function defaultSetter(state, key, value) {
  return _extends({}, state, _defineProperty({}, key, value));
};

var addMetadata = exports.addMetadata = function addMetadata(reducer) {
  var children = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var _options$getter = options.getter;
  var getter = _options$getter === undefined ? defaultGetter : _options$getter;
  var _options$setter = options.setter;
  var setter = _options$setter === undefined ? defaultSetter : _options$setter;


  reducer.meta = {
    reducer: reducer,
    get: function get(state, key) {
      key = _lodash2.default.toPath(key).filter(function (v) {
        return v;
      });
      var result = getter(state, key[0]);
      if (key.length === 1) return result;
      var childGetter = _lodash2.default.get(reducer, ['children', key, 'get']);
      return (childGetter || reducer.meta.get)(result, key.slice(1));
    },
    set: function set(state, key, value) {
      key = _lodash2.default.toPath(key).filter(function (v) {
        return v;
      });
      if (key.length === 1) return setter(state, key[0], value);
      var childSetter = _lodash2.default.get(reducer, ['children', key, 'set']);
      var result = (childSetter || reducer.meta.set)(getter(state, key[0]), key.slice(1), value);
      return setter(state, key[0], result);
    },
    traverse: function traverse(visitor) {
      var path = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      if (!reducer) return;
      var meta = reducer.meta || reducer;
      visitor(meta, path);
      _lodash2.default.mapValues(meta.children, function (child, childName) {
        return child.traverse(visitor, path.concat(childName));
      });
    }
  };

  reducer.meta.children = _lodash2.default.mapValues(children, function (child) {
    if (!child.meta) addMetadata(child);
    return _lodash2.default.set(child.meta, 'parent', reducer.meta);
  });

  return reducer;
};