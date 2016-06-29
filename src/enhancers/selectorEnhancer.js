// Psyche! selectorEnhancer is also the dynamicReducerEnhancer.
// They are coupled very tightly so implemented together.

import _ from 'lodash'
import {getModel} from '../getModel'
import {getGenerators} from '../getGenerators'
import {createEffect} from '../createEffect'
import {liftEffects} from '../helpers/liftEffects'
import {addMetadata, replaceNode} from '../helpers/metadata'
import {reduceInteruptable} from '../helpers/reduceInteruptable'
import {topologicalSort} from '../helpers/topologicalSort'

export const enhanceReducer = (reducer, depth = 0) => {
  if (!reducer.meta) addMetadata(reducer)
  let selectors = []
  const dynamicReducers = []
  reducer.meta.traverse((node, path) => {
    if (node.selector) selectors.push({...node, path})
    else if (node.isDynamic || node.isGenerated) dynamicReducers.push({...node, path})
  })

  selectors = topologicalSort(selectors)
  const nodes = dynamicReducers.concat(selectors)
  if (!nodes.length) return reducer

  // TODO: research/testing needed to ensure selectors reliably bubble effects
  return (state, action) => {
    let result = reduceInteruptable(
      nodes,
      (newState, node, i, a, interupt) => {
        // ignored nodes have already been applied to state
        if (node.ignore) return newState

        const _result = node.selector ?
          node.selector.reducer(getModel(newState), node.path) :
          node.reducer(reducer.meta.get(getModel(newState), node.path), action)

        if (node.isDynamic) {
          _result.meta.isGenerated = true
          const newReducer = replaceNode(reducer, node.path, _result)
          return interupt(enhanceReducer(newReducer, depth + 1)(newState, action))
        }

        node.ignore = true
        return createEffect(
          reducer.meta.set(
            getModel(newState),
            node.path,
            _result
          ),
          ...getGenerators(newState)
        )
      },
      depth ? state : reducer(state, action)
    )
    if (!depth) {
      nodes.forEach(node => delete node.ignore)
      // ad-hoc support for computaions that return effects
      // only works for single-nested reducers that return plain objects
      if (_.isPlainObject(result)) result = liftEffects(result)
    }
    return result
  }
}

export const selectorEnhancer = createStore => (reducer, ...args) =>
  createStore(enhanceReducer(reducer), ...args)
