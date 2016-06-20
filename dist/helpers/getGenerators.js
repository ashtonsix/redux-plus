"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var getGenerators = exports.getGenerators = function getGenerators(effect) {
  return effect && effect.isEffect ? effect[1] : [];
};