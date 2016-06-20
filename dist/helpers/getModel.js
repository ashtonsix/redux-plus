"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var getModel = exports.getModel = function getModel(effect) {
  return effect && effect.isEffect ? effect[0] : effect;
};