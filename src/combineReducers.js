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

    const result = hasChanged ? model : state
    return generators.length ?
      createEffect(result, ...generators) :
      result
  }
}

const addMetadata = (reducer, options = {}) => {
  const {getter = defaultGetter, setter = defaultSetter} = options
  const get = (state, key) => {
    key = _.toPath(key)
    const result = getter(state, key[0])
    if (key.length === 1) return result
    return reducer.children[key].get(result, key.slice(1))
  }
  const set = (state, key, value) => {
    key = _.toPath(key)
    if (key.length === 1) return setter(state, key[0], value)
    return setter(
      state, key[0],
      reducer.children[key].set(
        get(state, key[0]), key.slice(1), value))
  }
  const traverse = (_reducer) => (visitor, path = []) => {
    if (!_reducer) return
    if (_reducer.meta) _reducer = _reducer.meta
    visitor(_reducer, path)
    _.mapValues(_reducer.children,
      (child, childName) =>
        traverse(child)(visitor, path.concat(childName)))
  }

  reducer.meta = {reducer, get, set, traverse: traverse(reducer)}
  return reducer
}

export const combineReducers = (reducerMap, rootState = {}, options = {}) => {
  const finalReducer = _combineReducers(reducerMap, rootState, options)
  finalReducer.reducerMap = reducerMap

  addMetadata(finalReducer, options)
  finalReducer.meta.children = _.mapValues(reducerMap, child => {
    if (!child.meta) addMetadata(child)
    return _.set(child.meta, 'parent', finalReducer.meta)
  })

  return finalReducer
}
