"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var createReducer = exports.createReducer = function createReducer(reducers, defaultState) {
  return function (state, action) {
    if (state === undefined) state = defaultState;
    var reducer = reducers[action.type] || function (s) {
      return s;
    };
    return reducer(state, action);
  };
};