'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createArraySelector = undefined;

var _index = require('../index');

var _updateWith = require('./updateWith');

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
                                                                                                                                                                                                              state.reducerMap,
                                                                                                                                                                                                              todos.map(({id}) => createSelector(
                                                                                                                                                                                                                `todos.${id}`,
                                                                                                                                                                                                                'searchQuery',
                                                                                                                                                                                                                (_s, todo, searchQuery) => ({
                                                                                                                                                                                                                  ...todo,
                                                                                                                                                                                                                  hidden:
                                                                                                                                                                                                                    (todo.complete || !searchQuery.completeOnly) &&
                                                                                                                                                                                                                    (todo.name.indexOf(searchQuery.text) !== -1),
                                                                                                                                                                                                                }))),
                                                                                                                                                                                                              'cache.args.1'
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

  (0, _index.createDynamicReducer)((0, _index.createSelector)(arrayPointer, function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? (0, _index.combineReducers)([], []) : arguments[0];
    var items = arguments[1];
    return (0, _index.combineReducers)((0, _updateWith.updateWith)(state.reducerMap, items.map(function (item) {
      return _index.createSelector.apply(undefined, [itemResolver(item)].concat(_toConsumableArray(dependencies), [selector]));
    }), 'cache.args.1'));
  }));
};