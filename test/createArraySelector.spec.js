/* eslint func-names:0, prefer-arrow-callback:0 */

import expect from 'expect'
const {
  createStore, createReducer, combineReducers, createArraySelector,
} = require(`../${process.env.NODE_ENV === 'production' ? 'dist' : 'src'}/index`)

describe('createArraySelector', function () {
  let reducer
  let store

  beforeEach(function () {
    reducer = combineReducers({
      todos: createReducer(
        {
          ADD_TODO: ({result, entities}, {payload}) => ({
            result: result.concat(payload.id),
            entities: {...entities, [payload.id]: payload},
          }),
        },
        {
          result: ['a', 'b'],
          entities: {
            a: {id: 'a', name: 'Check the trunk.'},
            b: {id: 'b', name: 'Move the body.'},
          },
        }),
      searchQuery: createReducer({
        UPDATE_SEARCH: (state, {payload}) => payload,
      }, ''),
      searchResults: createArraySelector(
        'todos.result',
        todoId => `todos.entities.${todoId}`,
        ['searchQuery'],
        (state, todo, searchQuery) => ({
          ...todo,
          hidden: todo.name.indexOf(searchQuery) === -1,
        })
      ),
    })

    store = createStore(reducer)
  })

  it('should initialize with correct state', function () {
    expect(store.getState().searchResults).toEqual([
      {id: 'a', hidden: false, name: 'Check the trunk.'},
      {id: 'b', hidden: false, name: 'Move the body.'},
    ])
  })

  it('should update state correctly when dependencies update', function () {
    store.dispatch('UPDATE_SEARCH', 'Move')
    expect(store.getState().searchResults).toEqual([
      {id: 'a', hidden: true, name: 'Check the trunk.'},
      {id: 'b', hidden: false, name: 'Move the body.'},
    ])
  })

  it('should cache unchanged items when array is updated', function () {
    const item = store.getState().searchResults[0]
    store.dispatch('ADD_TODO', {id: 'd', name: 'Find an alibi.'})
    expect(store.getState().searchResults[0]).toBe(item)
  })
})
