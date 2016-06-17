import _ from 'lodash'
import {getModel} from 'redux-loop'

const AcyclicError = message => ({message})
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
      return [currentNode].concat(sortedNodes)
    }
    return sortedNodes
  }

  return nodes
    .map(node => ({...node, __status: 'inactive'}))
    .reduce(visit, [])
    .map(({__status, ...node}) => node) // eslint-disable-line no-unused-vars
}

export const enhanceReducer = reducer => {
  if (!reducer.selectors) return reducer
  let selectors = reducer.selectors.map(selector => ({
    ...selector,
    path: _.toPath(selector.path).join('.'),
    dependsOn: selector.dependsOn.map(dependency => {
      dependency = typeof dependency === 'function' ? dependency() : dependency // TODO: add local/global state arguments
      if (typeof dependency !== 'string') {
        console.error(`Dependency must be a string or return a string (${selector.path})`)
      }
      return _.toPath(dependency).join('.')
    }),
  }))

  try {
    selectors = topologicalSort(selectors)
  } catch (e) {
    if (e instanceof AcyclicError) console.error(e.message)
    else throw e
  }

  return enhanceReducer((state, action) =>
    selectors.reduce(
      (newState, {path, selector}) =>
        _.set(getModel(newState), path, selector(getModel(newState), path)),
      reducer(state, action)
    ))
}

export const selectorEnhancer = createStore => (reducer, ...args) =>
  createStore(enhanceReducer(reducer), ...args)
