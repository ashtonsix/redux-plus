import _ from 'lodash'
import {combineReducers as _combineReducers} from 'redux-loop'

const extendSelectorPaths = (reducer, fragment) => {
  if (!reducer.selectors) return reducer
  reducer.selectors = reducer.selectors.map(selector => ({
    dependsOn: selector.dependsOn,
    selector: extendSelectorPaths(selector.selector, fragment),
    path: [fragment, ...selector.path],
  }))
  return reducer
}

export const combineReducers = (reducerMap, ...args) => {
  const selectors = _.toPairs(reducerMap)
    .filter(([, reducer]) => reducer.selectors)
    .map(([key, reducer]) => extendSelectorPaths(reducer, key))
    .reduce((pv, v) => pv.concat(v.selectors), [])

  const finalReducer = _combineReducers(reducerMap, ...args)
  finalReducer.reducerMap = reducerMap

  if (selectors.length) {
    finalReducer.selectors = selectors
  }

  return finalReducer
}
