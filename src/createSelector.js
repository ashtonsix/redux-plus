import {getModel} from './helpers/getModel'
import {addMetadata} from './helpers/addMetadata'

// TODO: make cache length configurable & accessible
export const defaultMemoize = func => {
  const cache = {
    args: undefined,
    result: undefined,
  }

  return (...args) => {
    if (!cache.args || args.some((v, i) => cache.args[i] !== v)) {
      cache.args = args
      const result = func(...args)
      cache.result = getModel(cache)
      return result
    }
    return cache.result
  }
}

export const createSelector = (...args) => {
  const dependencies = args.slice(0, -1)
  const formula = args[args.length - 1]
  const memoizedFormula = defaultMemoize(formula)

  const reducer = state => state
  const selector = (globalState, selectorPath) =>
    memoizedFormula(
      reducer.meta.get(globalState, selectorPath),
      ...dependencies.map(path => reducer.meta.get(globalState, path)))

  addMetadata(reducer, {'': formula})
  reducer.meta.selector = {dependencies, reducer: selector}

  return reducer
}
