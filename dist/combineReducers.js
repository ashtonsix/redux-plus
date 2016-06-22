'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.combineReducers = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _createEffect = require('./createEffect');

var _addMetadata = require('./helpers/addMetadata');

var _liftEffects3 = require('./helpers/liftEffects');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var combineReducers = exports.combineReducers = function combineReducers(reducerMap) {
  var rootState = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var _options$getter = options.getter;
  var getter = _options$getter === undefined ? _addMetadata.defaultGetter : _options$getter;
  var _options$setter = options.setter;
  var setter = _options$setter === undefined ? _addMetadata.defaultSetter : _options$setter;


  var finalReducer = function finalReducer() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? rootState : arguments[0];
    var action = arguments[1];

    var hasChanged = false;

    var _liftEffects = (0, _liftEffects3.liftEffects)(_lodash2.default.mapValues(reducerMap, function (reducer, key) {
      var previousStateForKey = getter(state, key);
      var nextStateForKey = reducer(previousStateForKey, action);
      if (previousStateForKey !== nextStateForKey) hasChanged = true;
      return nextStateForKey;
    }));

    var _liftEffects2 = _slicedToArray(_liftEffects, 2);

    var model = _liftEffects2[0];
    var generators = _liftEffects2[1];


    var result = hasChanged ? Object.keys(model).reduce(function (_model, key) {
      return setter(_model, key, model[key]);
    }, rootState) : state;

    return generators.length ? _createEffect.createEffect.apply(undefined, [result].concat(_toConsumableArray(generators))) : result;
  };

  (0, _addMetadata.addMetadata)(finalReducer, reducerMap, options);

  return finalReducer;
};