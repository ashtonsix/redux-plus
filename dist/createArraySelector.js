'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createArraySelector = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _createDynamicReducer = require('./createDynamicReducer');

var _createSelector = require('./createSelector');

var _combineReducers = require('./combineReducers');

var _updateWith = require('./helpers/updateWith');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /*
                                                                                                                                                                                                    
                                                                                                                                                                                                    Example:
                                                                                                                                                                                                    createArraySelector(
                                                                                                                                                                                                      'todos',
                                                                                                                                                                                                      todo => `todos.${todo.id}`,
                                                                                                                                                                                                      ['searchQuery'],
                                                                                                                                                                                                      (state, todo, searchQuery) => ({
                                                                                                                                                                                                        ...todo,
                                                                                                                                                                                                        hidden:
                                                                                                                                                                                                          (todo.complete || !searchQuery.completeOnly) &&
                                                                                                                                                                                                          (todo.name.indexOf(searchQuery.text) !== -1),
                                                                                                                                                                                                      })
                                                                                                                                                                                                    )
                                                                                                                                                                                                    
                                                                                                                                                                                                    to:
                                                                                                                                                                                                    
                                                                                                                                                                                                    createDynamicReducer(
                                                                                                                                                                                                      createSelector(
                                                                                                                                                                                                        'todos',
                                                                                                                                                                                                        (state = combineReducers([], []), todos) =>
                                                                                                                                                                                                          combineReducers(
                                                                                                                                                                                                            updateWith(
                                                                                                                                                                                                              state.meta.children,
                                                                                                                                                                                                              todos.map(({id}) => createSelector(
                                                                                                                                                                                                                `todos.${id}`,
                                                                                                                                                                                                                'searchQuery',
                                                                                                                                                                                                                (_s, todo, searchQuery) => ({
                                                                                                                                                                                                                  ...todo,
                                                                                                                                                                                                                  hidden:
                                                                                                                                                                                                                    (todo.complete || !searchQuery.completeOnly) &&
                                                                                                                                                                                                                    (todo.name.indexOf(searchQuery.text) !== -1),
                                                                                                                                                                                                                }))),
                                                                                                                                                                                                              'reducer.cache.args.1'
                                                                                                                                                                                                            )
                                                                                                                                                                                                          )
                                                                                                                                                                                                      )
                                                                                                                                                                                                    )
                                                                                                                                                                                                     */

var createArraySelector = exports.createArraySelector = function createArraySelector(arrayPointer, itemResolver, dependencies, selector) {
  if (typeof dependencies === 'function') {
    selector = dependencies;
    dependencies = [];
  }

  (0, _createDynamicReducer.createDynamicReducer)((0, _createSelector.createSelector)(arrayPointer, function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? (0, _combineReducers.combineReducers)([], []) : arguments[0];
    var items = arguments[1];
    return (0, _combineReducers.combineReducers)((0, _updateWith.updateWith)(_lodash2.default.values(state.meta.children), items.map(function (item) {
      return _createSelector.createSelector.apply(undefined, [itemResolver(item)].concat(_toConsumableArray(dependencies), [selector]));
    }), 'reducer.cache.args.1'));
  }));
};