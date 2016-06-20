"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var getEffect = exports.getEffect = function getEffect(effect) {
  return effect && effect.isEffect ? effect[1] : [];
};