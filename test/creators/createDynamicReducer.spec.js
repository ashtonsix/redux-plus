/* eslint-disable */
/* eslint func-names:0, prefer-arrow-callback:0 */

import expect from 'expect'
import {createReducer, createSelector, combineReducers} from '../../src/index'

const createDynamicReducer = () => {}
const updateWith = (originalArr, newArr, equivalenceCheck) => {}

describe.skip('createDynamicReducer', function () {
  let reducer
  let store

  beforeEach(function () {
    reducer = combineReducers({
      todos: createReducer(
        {UPDATE_TODOS: (state, {payload}) => payload},
        [
          {id: 0, name: 'Check the trunk.', complete: false},
          {id: 1, name: 'Move the body.', complete: false},
        ]),
      searchQuery: createReducer(
        {UPDATE_SEARCH: (state, {payload}) => payload},
        {text: '', completeOnly: false}),
      searchResults: createDynamicReducer(
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
      ),
    })
  })
})
