import _ from 'lodash'
import {createDynamicReducer} from './createDynamicReducer'
import {createSelector} from './createSelector'
import {combineReducers} from './combineReducers'
import {transferTo} from './helpers/transferTo'

export const createArraySelector = (arrayPointer, itemResolver, dependencies, selector, rootState = []) => {
  if (typeof dependencies === 'function') {
    selector = dependencies
    dependencies = []
  }

  return createDynamicReducer(
    createSelector(
      arrayPointer,
      (state = combineReducers(), items) =>
        combineReducers(
          transferTo(
            _.toArray(state.meta.children).map(s => s.reducer),
            items.map(item => createSelector(
              itemResolver(item),
              ...dependencies,
              selector)),
            i => _.get(i, 'meta.selector.dependencies').join(',')
          ), rootState)))
}
