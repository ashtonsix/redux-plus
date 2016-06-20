"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var createReducer = exports.createReducer = function createReducer(reducerMap, defaultState) {
  return function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? defaultState : arguments[0];
    var action = arguments[1];

    var reducer = reducerMap[action.type] || function (s) {
      return s;
    };
    return reducer(state, action);
  };
};