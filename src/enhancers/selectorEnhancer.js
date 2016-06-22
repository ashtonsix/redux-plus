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

export const enhanceReducer = (reducer) => {
  let selectors = []
  if (reducer && reducer.meta) {
    reducer.meta.traverse((node, path) => {
      if (node.selector) selectors.push({...node.selector, path})
    })
  }
  if (!selectors.length) return reducer
  selectors = topologicalSort(selectors)

  return (state, action) =>
    liftEffects(
      selectors.reduce(
        (newState, selector) =>
          reducer.meta.set(
            getModel(newState),
            selector.path,
            selector.reducer(getModel(newState), selector.path)
        ),
        reducer(state, action)
      )
    )
}

export const selectorEnhancer = createStore => (reducer, ...args) =>
  createStore(enhanceReducer(reducer), ...args)
