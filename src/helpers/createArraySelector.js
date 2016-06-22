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

import _ from 'lodash'
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
            _.values(state.meta.children),
            items.map(item => createSelector(
              itemResolver(item),
              ...dependencies,
              selector)),
            'reducer.cache.args.1'
          ))))
}
