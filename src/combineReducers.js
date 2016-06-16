import _ from 'lodash'
import {combineReducers as _combineReducers} from 'redux-loop'

export const combineReducers = (reducerMap, ...args) => {
  const selectorStats = _.toPairs(reducerMap)
    .filter(([, reducer]) => reducer.__REDUX_PLUS$isSelector)
    .map(([key, reducer]) =>
      reducer.__REDUX_PLUS$selectorStats.map(stat => ({
        ...stat,
        path: [key, ...stat.path],
      })))
    .reduce((pv, v) => pv.concat(v), [])

  const finalReducer = _combineReducers(reducerMap, ...args)

  if (selectorStats.length) {
    finalReducer.__REDUX_PLUS$selectorStats = selectorStats
  }

  return finalReducer
}
