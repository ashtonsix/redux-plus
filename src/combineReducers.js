import _ from 'lodash'
import {combineReducers as _combineReducers} from 'redux-loop'

export const combineReducers = (reducerMap, ...args) => {
  const selectors = _.toPairs(reducerMap)
    .filter(([, reducer]) => reducer.selectors)
    .map(([key, reducer]) =>
      reducer.selectors.map(stat => ({
        ...stat,
        path: [key, ...stat.path],
      })))
    .reduce((pv, v) => pv.concat(v), [])

  const finalReducer = _combineReducers(reducerMap, ...args)

  if (selectors.length) {
    finalReducer.selectors = selectors
  }

  return finalReducer
}
