// Psyche! selectorEnhancer is also the dynamicReducerEnhancer.
// They are coupled very tightly so implemented together.

import _ from 'lodash'
import {getModel} from '../helpers/getModel'
import {liftEffects} from '../helpers/liftEffects'
import {addMetadata, replaceNode} from '../helpers/addMetadata'
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
          let newReducer = {meta: _.cloneDeep(reducer.meta)}
          _result.meta.isGenerated = true
          newReducer = replaceNode(reducer, node.path, _result)
          interupt(enhanceReducer(newReducer, depth + 1)(newState, action))
        }

        node.ignore = true
        return reducer.meta.set(
          getModel(newState),
          node.path,
          _result
        )
      },
      depth ? state : reducer(state, action)
    )
    if (!depth) {
      nodes.forEach(node => delete node.ignore)
      result = liftEffects(result)
    }
    return result
  }
}

export const selectorEnhancer = createStore => (reducer, ...args) =>
  createStore(enhanceReducer(reducer), ...args)
