import {applyMiddleware, compose} from 'redux'
import {dispatchEnhancer, effectEnhancer, selectorEnhancer} from './enhancers'

const ignoreNull = () => next => action => {
  if (action != null) next(action)
  return action
}

const stringToType = () => next => action => {
  if (typeof action === 'string') action = {type: action, payload: null}
  next(action)
  return action
}

const storeEnhancer = compose(
  dispatchEnhancer,
  selectorEnhancer,
  effectEnhancer,
  // monkey-patch for redux-loop behaviour (effectEnhancer)
  applyMiddleware(ignoreNull, stringToType)
)

// flag for createStore
storeEnhancer.__REDUX_PLUS$isStoreEnhancer = true

export {storeEnhancer}
