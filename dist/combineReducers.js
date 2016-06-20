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

var _getEffect = require('./helpers/getEffect');

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
      var _effects = _ref2[1];

      var reducer = reducerMap[key];
      var previousStateForKey = getter(state, key);
      var nextStateForKey = reducer(previousStateForKey, action);

      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
      return [setter(_model, key, (0, _getModel.getModel)(nextStateForKey)), _effects.concat((0, _getEffect.getEffect)(nextStateForKey))];
    }, [root, []]);

    var _Object$keys$reduce2 = _slicedToArray(_Object$keys$reduce, 2);

    var model = _Object$keys$reduce2[0];
    var effects = _Object$keys$reduce2[1];


    return _createEffect.createEffect.apply(undefined, [hasChanged ? model : state].concat(_toConsumableArray(effects)));
  };
};

var combineReducers = exports.combineReducers = function combineReducers(reducerMap) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var selectors = _lodash2.default.toPairs(reducerMap).filter(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2);

    var reducer = _ref4[1];
    return reducer.selectors;
  }).map(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2);

    var key = _ref6[0];
    var reducer = _ref6[1];
    return extendSelectorPaths(reducer, key);
  }).reduce(function (pv, v) {
    return pv.concat(v.selectors);
  }, []);

  var finalReducer = _combineReducers.apply(undefined, [reducerMap].concat(args));
  finalReducer.reducerMap = reducerMap;

  if (selectors.length) {
    finalReducer.selectors = selectors;
  }

  return finalReducer;
};