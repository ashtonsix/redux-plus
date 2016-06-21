'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.combineReducers = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _createEffect = require('./createEffect');

var _getModel = require('./helpers/getModel');

var _getGenerators = require('./helpers/getGenerators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var extendSelectorPaths = function extendSelectorPaths(reducer, fragment) {
  if (!reducer.selectors) return reducer;
  reducer.selectors = reducer.selectors.map(function (selector) {
    return {
      dependsOn: selector.dependsOn,
      selector: extendSelectorPaths(selector.selector, fragment),
      path: [fragment].concat(_toConsumableArray(selector.path))
    };
  });
  return reducer;
};

var defaultGetter = function defaultGetter(state, key) {
  return state[key];
};

var defaultSetter = function defaultSetter(state, key, value) {
  return _extends({}, state, _defineProperty({}, key, value));
};

var _combineReducers = function _combineReducers(reducerMap) {
  var getter = defaultGetter;
  var setter = defaultSetter;
  var root = {};

  return function finalReducer() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? root : arguments[0];
    var action = arguments[1];

    var hasChanged = false;

    var _Object$keys$reduce = Object.keys(reducerMap).reduce(function (_ref, key) {
      var _ref2 = _slicedToArray(_ref, 2);

      var _model = _ref2[0];
      var _generators = _ref2[1];

      var reducer = reducerMap[key];
      var previousStateForKey = getter(state, key);
      var nextStateForKey = reducer(previousStateForKey, action);

      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
      return [setter(_model, key, (0, _getModel.getModel)(nextStateForKey)), _generators.concat((0, _getGenerators.getGenerators)(nextStateForKey))];
    }, [root, []]);

    var _Object$keys$reduce2 = _slicedToArray(_Object$keys$reduce, 2);

    var model = _Object$keys$reduce2[0];
    var generators = _Object$keys$reduce2[1];


    var result = hasChanged ? model : state;
    return generators.length ? _createEffect.createEffect.apply(undefined, [result].concat(_toConsumableArray(generators))) : result;
  };
};

var addMetadata = function addMetadata(reducer) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var _options$getter = options.getter;
  var getter = _options$getter === undefined ? defaultGetter : _options$getter;
  var _options$setter = options.setter;
  var setter = _options$setter === undefined ? defaultSetter : _options$setter;

  var get = function get(state, key) {
    key = _lodash2.default.toPath(key);
    var result = getter(state, key[0]);
    if (key.length === 1) return result;
    return reducer.children[key].get(result, key.slice(1));
  };
  var set = function set(state, key, value) {
    key = _lodash2.default.toPath(key);
    if (key.length === 1) return setter(state, key[0], value);
    return setter(state, key[0], reducer.children[key].set(get(state, key[0]), key.slice(1), value));
  };
  var traverse = function traverse(_reducer) {
    return function (visitor) {
      var path = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      if (!_reducer) return;
      if (_reducer.meta) _reducer = _reducer.meta;
      visitor(_reducer, path);
      _lodash2.default.mapValues(_reducer.children, function (child, childName) {
        return traverse(child)(visitor, path.concat(childName));
      });
    };
  };

  reducer.meta = { reducer: reducer, get: get, set: set, traverse: traverse(reducer) };
  return reducer;
};

var combineReducers = exports.combineReducers = function combineReducers(reducerMap) {
  var rootState = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var finalReducer = _combineReducers(reducerMap, rootState, options);
  finalReducer.reducerMap = reducerMap;

  addMetadata(finalReducer, options);
  finalReducer.meta.children = _lodash2.default.mapValues(reducerMap, function (child) {
    if (!child.meta) addMetadata(child);
    return _lodash2.default.set(child.meta, 'parent', finalReducer.meta);
  });

  return finalReducer;
};