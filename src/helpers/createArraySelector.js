/*

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

import {createDynamicReducer, createSelector, combineReducers} from '../index'
import {updateWith} from './updateWith'

export const createArraySelector = (arrayPointer, itemResolver, dependencies, selector) => {
  if (typeof dependencies === 'function') {
    selector = dependencies
    dependencies = []
  }

  createDynamicReducer(
    createSelector(
      arrayPointer,
      (state = combineReducers([], []), items) =>
        combineReducers(
          updateWith(
            state.reducerMap,
            items.map(item => createSelector(
              itemResolver(item),
              ...dependencies,
              selector)),
            'cache.args.1'
          ))))
}
