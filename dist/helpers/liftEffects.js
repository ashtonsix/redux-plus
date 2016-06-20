'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.liftEffects = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _index = require('../index');

var _getModel = require('./getModel');

var _getGenerators = require('./getGenerators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var liftEffects = exports.liftEffects = function liftEffects(object) {
  return _index.createEffect.apply(undefined, [_lodash2.default.mapValues(object, _getModel.getModel)].concat(_toConsumableArray(_lodash2.default.flatten(_lodash2.default.values(object).map(_getGenerators.getGenerators).filter(function (v) {
    return v;
  })))));
};