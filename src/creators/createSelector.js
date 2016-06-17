import _ from 'lodash'

export const defaultMemoize = func => {
  const cache = {
    args: undefined,
    result: undefined,
  }

  return (...args) => {
    if (!cache.args || args.some((v, i) => cache.args[i] !== v)) {
      cache.args = args
      cache.result = func(...args)
    }
    return cache.result
  }
}

export const createSelector = (...args) => {
  const dependencies = args.slice(0, -1)
  const reducer = defaultMemoize(args[args.length - 1])

  const selector = state => state
  selector.selectors = [{
    path: [], dependsOn: dependencies,
    selector: (globalState, selectorPath) => {
      const localState = _.get(globalState, selectorPath)
      const reducerArgs = dependencies.map(path => {
        if (typeof path === 'function') path = path(localState, globalState)
        return _.get(globalState, path)
      })
      return reducer(localState, ...reducerArgs)
    }}]

  return selector
}
