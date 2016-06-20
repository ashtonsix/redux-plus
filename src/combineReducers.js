import _ from 'lodash'
import {createEffect} from './createEffect'
import {getModel} from './helpers/getModel'
import {getGenerators} from './helpers/getGenerators'

const extendSelectorPaths = (reducer, fragment) => {
  if (!reducer.selectors) return reducer
  reducer.selectors = reducer.selectors.map(selector => ({
    dependsOn: selector.dependsOn,
    selector: extendSelectorPaths(selector.selector, fragment),
    path: [fragment, ...selector.path],
  }))
  return reducer
}

const defaultGetter = (state, key) => state[key]

const defaultSetter = (state, key, value) => ({
  ...state,
  [key]: value,
})

const _combineReducers = (reducerMap) => {
  const getter = defaultGetter
  const setter = defaultSetter
  const root = {}

  return function finalReducer(state = root, action) {
    let hasChanged = false

    const [model, generators] = Object.keys(reducerMap).reduce(([_model, _generators], key) => {
      const reducer = reducerMap[key]
      const previousStateForKey = getter(state, key)
      const nextStateForKey = reducer(previousStateForKey, action)

      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
      return [setter(_model, key, getModel(nextStateForKey)), _generators.concat(getGenerators(nextStateForKey))]
    }, [root, []])

    return createEffect(
      hasChanged ? model : state,
      ...generators
    )
  }
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
