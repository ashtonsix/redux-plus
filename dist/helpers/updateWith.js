'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateWith = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var updateWith = exports.updateWith = function updateWith(orignalArray, updatedArray, comparator) {
  comparator = typeof comparator === 'function' ? comparator : function (v) {
    return _lodash2.default.get(v, comparator);
  };

  var result = updatedArray.slice();
  var __updated = updatedArray.map(comparator);
  // Used O(n²) implementation because higher-order functions cannot be
  // unique keys if they use the same decorator (in JavaScript)
  orignalArray.map(comparator).forEach(function (v1, i1) {
    var i2 = __updated.findIndex(function (v2) {
      return v1 === v2;
    });
    var v2 = __updated[i2];
    if (v1 === v2) result[i1] = orignalArray[i2];
  });

  return result;
};