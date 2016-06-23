import {getModel} from '../getModel'
import {getGenerators} from '../getGenerators'

export const effectEnhancer = (next) => (reducer, initialState, enhancer) => {
  let currentGenerators = []
  const [initialModel, initialGenerators] = [getModel(initialState), getGenerators(initialState)]

  const enhanceReducer = _reducer => (state, action) => {
    const result = _reducer(state, action)
    currentGenerators = getGenerators(result)
    return getModel(result)
  }

  const store = next(enhanceReducer(reducer), initialModel, enhancer)

  const runEffect = generators =>
    Promise
      .all(generators.map(g =>
        new Promise(resolve => resolve(typeof g === 'function' ? g() : g))
          .catch(e => {
            // TODO: include node path that returned generator
            console.error('error while running generator')
            throw e
          })))
      .then(actions => actions.forEach(a => a != null && store.dispatch(a)))

  const _dispatch = store.dispatch
  store.dispatch = (...args) => {
    const result = _dispatch(...args)
    runEffect(currentGenerators)
    currentGenerators = []
    return result
  }

  const _replaceReducer = store.replaceReducer
  store.replaceReducer = _reducer => _replaceReducer(enhanceReducer(_reducer))

  runEffect(initialGenerators)

  return store
}
