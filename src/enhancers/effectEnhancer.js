import {applyMiddleware, compose} from 'redux'
import {getModel} from '../helpers/getModel'
import {getEffect} from '../helpers/getEffect'

const install = (next) => (reducer, initialState, enhancer) => {
  let currentEffect = []
  const [initialModel, initialEffect] = [getModel(initialState), getEffect(initialState)]

  const enhanceReducer = _reducer => (state, action) => {
    const result = _reducer(state, action)
    currentEffect = getEffect(result)
    return getModel(result)
  }

  const store = next(enhanceReducer(reducer), initialModel, enhancer)

  const runEffect = effect =>
    Promise
      .all(effect.map(e => Promise.resolve(typeof e === 'function' ? e() : e)))
      .then(actions => actions.forEach(a => a != null && store.dispatch(a)))

  const _dispatch = store.dispatch
  store.dispatch = (...args) => {
    const result = _dispatch(...args)
    runEffect(currentEffect)
    currentEffect = []
    return result
  }

  const _replaceReducer = store.replaceReducer
  store.replaceReducer = _reducer => _replaceReducer(enhanceReducer(_reducer))

  runEffect(initialEffect)

  return store
}

const stringToType = () => next => action => {
  if (typeof action === 'string') action = {type: action, payload: null}
  next(action)
  return action
}

export const effectEnhancer = compose(
  install,
  applyMiddleware(stringToType)
)
