'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createEffect = undefined;

var _reduxLoop = require('redux-loop');

var createEffect = exports.createEffect = function createEffect(state) {
  for (var _len = arguments.length, effects = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    effects[_key - 1] = arguments[_key];
  }

  return (0, _reduxLoop.loop)(state, _reduxLoop.Effects.batch(effects.map(function (e) {
    return _reduxLoop.Effects.promise(function () {
      return Promise.resolve(typeof e === 'function' ? e() : e);
    });
  })));
};