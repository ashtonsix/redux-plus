import _ from 'lodash'
import {createEffect} from './createEffect'
import {addMetadata} from './helpers/metadata'
import {defaultGetter} from './helpers/defaultGetter'
import {defaultSetter} from './helpers/defaultSetter'
import {liftEffects} from './helpers/liftEffects'

export const combineReducers = (reducerMap, rootState = {}, options = {}) => {
  const {getter = defaultGetter, setter = defaultSetter} = options
  // TODO: remove this monkey-patch and create a better fix: reducerMap should always be an object
  // the problem probably stems from createDynamicReducer inheriting getters/setters from reducer state
  if (reducerMap && reducerMap['@@__IMMUTABLE_ITERABLE__@@']) reducerMap = reducerMap.toJS()

  const finalReducer = (state = rootState, action) => {
    let hasChanged = false

    const [model, generators] =
    liftEffects(
      _.mapValues(reducerMap, (reducer, key) => {
        const previousStateForKey = getter(state, key)
        const nextStateForKey = reducer(previousStateForKey, action)
        if (previousStateForKey !== nextStateForKey) hasChanged = true
        return nextStateForKey
      })
    )

    const result = hasChanged ?
      Object.keys(model).reduce((_model, key) => setter(_model, key, model[key]), rootState) :
      state

    return generators.length ?
      createEffect(result, ...generators) :
      result
  }

  addMetadata(finalReducer, reducerMap, options)

  return finalReducer
}
