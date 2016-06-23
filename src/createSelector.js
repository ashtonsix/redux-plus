import {addMetadata} from './helpers/addMetadata'
import {defaultMemoize} from './helpers/memoize'

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
