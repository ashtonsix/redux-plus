'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.combineReducers = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _reduxLoop = require('redux-loop');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var combineReducers = exports.combineReducers = function combineReducers(reducerMap) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var selectors = _lodash2.default.toPairs(reducerMap).filter(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var reducer = _ref2[1];
    return reducer.selectors;
  }).map(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2);

    var key = _ref4[0];
    var reducer = _ref4[1];
    return reducer.selectors.map(function (stat) {
      return _extends({}, stat, {
        path: [key].concat(_toConsumableArray(stat.path))
      });
    });
  }).reduce(function (pv, v) {
    return pv.concat(v);
  }, []);

  var finalReducer = _reduxLoop.combineReducers.apply(undefined, [reducerMap].concat(args));

  if (selectors.length) {
    finalReducer.selectors = selectors;
  }

  return finalReducer;
};