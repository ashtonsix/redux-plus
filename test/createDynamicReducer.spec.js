/* eslint-disable */
/* eslint func-names:0, prefer-arrow-callback:0 */

import expect from 'expect'
import {createReducer, createSelector, combineReducers} from '../src/index'

const createDynamicReducer = () => {}
const updateWith = (originalArr, newArr, equivalenceCheck) => {}

describe.skip('createDynamicReducer', function () {
  describe('dynamicSelector', function () {
    let reducer
    let store
    beforeEach(function () {
      reducer = combineReducers({
        todos: createReducer({
          ADD_TODO: (state, {payload}) => state.concat(payload),
          UPDATE_LAST_TODO: (state, {payload}) => {
            state[state.length - 1] = payload
            return state
          }
        }, ['Kill her']),
        lastTodo: createDynamicReducer(
          createSelector(
            'todos',
            (state, todos) => createSelector(
              `todos.${todos.length - 1}`,
              (state, todo) => todo
            )
          )
        )
      })
    })

    it('should initialize with correct state', function () {
      expect(store.getState().lastTodo).toBe('Kill her')
    })

    it('should update state when actions are dispatched', function () {
      store.dispatch('ADD_TODO', 'Hide the evidence')
      expect(store.getState().lastTodo).toBe('Hide the evidence')
      store.dispatch('UPDATE_LAST_TODO', 'Put her in the trunk')
      expect(store.getState().lastTodo).toBe('Put her in the trunk')
    })
  })

  describe('dynamicArray', function () {
    let reducer
    let store

    beforeEach(function () {
      reducer = combineReducers({
        todos: createReducer(
          {UPDATE_TODOS: (state, {payload}) => payload},
          {
            result: [0, 1],
            entities: {
              0: {id: 0, name: 'Check the trunk.', complete: false},
              1: {id: 1, name: 'Move the body.', complete: false},
            }
          }),
        searchQuery: createReducer(
          {
            UPDATE_SEARCH_TEXT: (state, {payload}) => ({...state, text: payload}),
            UPDATE_SEARCH_TOGGLE: (state, {payload}) => ({...state, [payload]: !state[payload]}),
          },
          {text: '', completeOnly: false}),
        searchResults: createDynamicReducer(
          createSelector(
            'todos.result',
            (state = combineReducers([], []), todos) =>
              combineReducers(
                updateWith(
                  state.meta.children,
                  todos.map(todoId => createSelector(
                    `todos.entities.${id}`,
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
        ),
      })
    })
  })
})
