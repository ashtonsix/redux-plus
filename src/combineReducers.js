import _ from 'lodash'
import {createEffect} from './createEffect'
import {addMetadata} from './helpers/addMetadata'
import {liftEffects} from './helpers/liftEffects'

const defaultGetter = (state, key) => state[key]
const defaultSetter = (state, key, value) => ({
  ...state,
  [key]: value,
})

export const combineReducers = (reducerMap, rootState = {}, options = {}) => {
  const finalReducer = (state = rootState, action) => {
    let hasChanged = false

    const [model, generators] =
    liftEffects(
      _.mapValues(reducerMap, (reducer, key) => {
        const previousStateForKey = defaultGetter(state, key)
        const nextStateForKey = reducer(previousStateForKey, action)
        if (previousStateForKey !== nextStateForKey) hasChanged = true
        return nextStateForKey
      })
    )

    const result = hasChanged ?
      Object.keys(model).reduce((_model, key) => defaultSetter(_model, key, model[key]), rootState) :
      state

    return generators.length ?
      createEffect(result, ...generators) :
      result
  }

  addMetadata(finalReducer, reducerMap, options)

  return finalReducer
}
