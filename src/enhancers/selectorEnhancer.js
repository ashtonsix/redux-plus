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
      sortedNodes = currentNode.dependencies.map(key => nodeMap[key]).filter(n => n).reduce(visit, sortedNodes)
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
  let selectors = []
  if (reducer && reducer.meta) {
    reducer.meta.traverse((node, path) => {
      if (node.selector) selectors.push({...node.selector, path})
    })
  }
  if (!selectors.length) return reducer

  // TODO: Support dynamic dependency paths
  selectors = topologicalSort(
    selectors.map(selector => ({
      ...selector,
      path: _.toPath(selector.path).join('.'),
      dependencies: selector.dependencies.map(dependency =>
        _.toPath(dependency).join('.')),
    }))
  )

  return (state, action) =>
    liftEffects(
      selectors.reduce(
        (newState, {path, reducer: _reducer}) => {
          const result = _reducer(getModel(newState), path)
          path = _.toPath(path).filter(v => v).join('.')
          return _.set(getModel(newState), path, result)
        },
        depth ? state : reducer(state, action)
      )
    )
}

export const selectorEnhancer = createStore => (reducer, ...args) =>
  createStore(enhanceReducer(reducer), ...args)
