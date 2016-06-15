import {applyMiddleware, compose} from 'redux'
import {install} from 'redux-loop'

// implementing as storeEnhancer is necessary for second argument
const enhanceDispatch = next => (reducer, state) => {
  const store = next(reducer, state)
  const _dispatch = store.dispatch
  store.dispatch = (action, payload = null) => {
    const newAction = typeof action === 'string' ? {type: action, payload} : action
    return _dispatch(newAction)
  }
  return store
}

// prevents redux-loop dispatching invalid actions
const ignoreNull = () => next => action => {
  if (action != null) next(action)
  return action
}

// fix type strings from redux-loop
const stringToType = () => next => action => {
  if (typeof action === 'string') action = {type: action, payload: null}
  next(action)
  return action
}

const storeEnhancer = compose(
  enhanceDispatch,
  install(),
  applyMiddleware(ignoreNull, stringToType),
)

// flag for createStore
storeEnhancer.__REDUX_PLUS$isStoreEnhancer = true

export {storeEnhancer}
