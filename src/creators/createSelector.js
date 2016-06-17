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
  const formula = args[args.length - 1]
  const memoizedFormula = defaultMemoize(formula)

  const reducer = state => state
  const selector = (globalState, selectorPath) => {
    // console.log(2, globalState, dependencies, selectorPath)
    const localState = _.get(globalState, selectorPath)
    const formulaArgs = dependencies.map(path => {
      if (typeof path === 'function') path = path(localState, globalState)
      return _.get(globalState, path)
    })
    return memoizedFormula(localState, ...formulaArgs)
  }
  if (formula.selectors) selector.selectors = formula.selectors
  reducer.selectors = [{path: [], dependsOn: dependencies, selector}]

  return reducer
}
