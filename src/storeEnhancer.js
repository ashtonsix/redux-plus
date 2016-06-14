import {applyMiddleware, compose} from 'redux'
import {install} from 'redux-loop'

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

const storeEnhancer = compose(
  enhanceDispatch,
  install(),
  applyMiddleware(ignoreNull),
)

// flag for createStore
storeEnhancer.__REDUX_PLUS$isStoreEnhancer = true

export {storeEnhancer}
