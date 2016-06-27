/* eslint func-names:0, prefer-arrow-callback:0 */

import expect from 'expect'
const {
  createStore, createReducer, createSelector, createDynamicReducer, combineReducers,
} = require(`../${process.env.NODE_ENV === 'production' ? 'modules' : 'src'}/index`)

describe('createDynamicReducer', function () {
  let reducer
  let store
  beforeEach(function () {
    reducer = combineReducers({
      todos: createReducer({
        ADD_TODO: (state, {payload}) => state.concat(payload),
        UPDATE_LAST_TODO: (state, {payload}) => {
          state[state.length - 1] = payload
          return state
        },
      }, ['Kill her']),
      lastTodo: createDynamicReducer(
        createSelector(
          'todos',
          (state, todos) => createSelector(
            `todos.${todos.length - 1}`,
            (_s, todo) => todo,
          ))),
    })

    store = createStore(reducer)
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

  // TODO: Add test to confirm DynamicReducerError is thrown correctly
})
