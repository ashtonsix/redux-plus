import {applyMiddleware, compose} from 'redux'
import {install} from 'redux-loop'

const ignoreNull = () => next => action => {
  if (action != null) next(action)
  return action
}

const stringToType = () => next => action => {
  if (typeof action === 'string') action = {type: action, payload: null}
  next(action)
  return action
}

export const effectEnhancer = compose(
  install(),
  // monkey-patch for redux-loop behaviour (effectEnhancer)
  applyMiddleware(ignoreNull, stringToType)
)
