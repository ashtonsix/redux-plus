import _ from 'lodash'
import {addMetadata} from './helpers/addMetadata'
import {defaultMemoize} from './helpers/memoize'
import {createDynamicReducer} from './createDynamicReducer'

// Resolves circular dependency between createSelector & createDynamicSelector
const _functions = {}

export const createSelector = (...args) => {
  const dependencies = args.slice(0, -1)
  if (dependencies.some(v => v instanceof Array)) {
    return _functions.createDynamicSelector(...args)
  }

  let formula = args[args.length - 1]
  const meta = formula.meta
  formula = defaultMemoize(formula, [true])
  if (meta) formula.meta = meta

  const reducer = state => state
  const selector = (globalState, selectorPath, previousState) =>
    formula(
      previousState || reducer.meta.get(globalState, selectorPath),
      ...dependencies.map(path => reducer.meta.get(globalState, path)))

  addMetadata(reducer, {'': formula})
  reducer.meta.selector = {dependencies, reducer: selector}

  return reducer
}

export const createDynamicSelector = (...args) => {
  let dependencies = args.slice(0, -1)
  const formula = args[args.length - 1]
  const uniqueDynamicDependencies = _.uniq(_.flatten(dependencies.filter(v => v instanceof Array).map(v => v.slice(0, -1))))
  dependencies = dependencies.map(dependency => {
    if (!(dependency instanceof Array)) return dependency
    const _formula = dependency[dependency.length - 1]
    const dependencyIndexes = dependency.slice(0, -1).map(v1 => uniqueDynamicDependencies.findIndex(v2 => v1 === v2))
    return (state, ..._args) => {
      _args = dependencyIndexes.map(i => _args[i])
      return _formula(state, ..._args)
    }
  })
  return createDynamicReducer(
    _functions.createSelector(
      ...uniqueDynamicDependencies,
      (..._args) => _functions.createSelector(
        ...dependencies.map(dependency => dependency(..._args)),
        formula
      )
    )
  )
}

_functions.createDynamicSelector = createDynamicSelector
_functions.createSelector = createSelector
