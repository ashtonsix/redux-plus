"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var createEffect = exports.createEffect = function createEffect(state) {
  for (var _len = arguments.length, generators = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    generators[_key - 1] = arguments[_key];
  }

  var effect = [state, generators];
  effect.isEffect = true;
  return effect;
};