import _ from 'lodash'
import {getModel} from '../helpers/getModel'
import {liftEffects} from '../helpers/liftEffects'

const AcyclicError = message => ({message})
// TODO: to support createDynamicReducer a node is considered to have edge to all parents of nodes it has edges to
// re-sort selectors after evaluating a dynamicReducer. Memoize if possible
const topologicalSort = nodes => {
  const nodeMap = _.fromPairs(nodes.map(node => [node.path, node]))
  const visit = (sortedNodes, currentNode) => {
    if (currentNode.__status === 'active') {
      throw new AcyclicError(`Selector has circular dependency (${currentNode.path})`)
    }
    if (currentNode.__status === 'inactive') {
      currentNode.__status = 'active'
      sortedNodes = currentNode.dependsOn.map(key => nodeMap[key]).filter(n => n).reduce(visit, sortedNodes)
      currentNode.__status = 'complete'
      return sortedNodes.concat(currentNode)
    }
    return sortedNodes
  }

  return nodes
    .map(node => ({...node, __status: 'inactive'}))
    .reduce(visit, [])
    .map(({__status, ...node}) => node) // eslint-disable-line no-unused-vars
}

export const enhanceReducer = (reducer, depth = 0) => {
  if (!reducer.selectors) return reducer

  // TODO: Support dynamic dependency paths
  const selectors = topologicalSort(
    reducer.selectors.map(selector => ({
      ...selector,
      path: _.toPath(selector.path).join('.'),
      dependsOn: selector.dependsOn.map(dependency =>
        _.toPath(dependency).join('.')),
    }))
  )

  return (state, action) =>
    liftEffects(
      selectors.reduce(
        (newState, {path, selector}) => {
          const result = enhanceReducer(selector, depth + 1)(getModel(newState), path)
          return selector.selectors ?
            result :
            _.set(getModel(newState), path, result)
        },
        depth ? state : reducer(state, action)
      )
    )
}

export const selectorEnhancer = createStore => (reducer, ...args) =>
  createStore(enhanceReducer(reducer), ...args)
