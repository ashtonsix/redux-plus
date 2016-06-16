import _ from 'lodash'

const AcyclicError = message => ({message})
const topologicalSort = nodes => {
  const nodeMap = _.fromPairs(nodes.map(node => [node.path, node]))
  const visit = (sortedNodes, currentNode) => {
    if (currentNode.__status === 'active') {
      throw new AcyclicError(`Selector has circular dependency (${currentNode.path})`)
    }
    if (currentNode.__status === 'inactive') {
      currentNode.__status = 'active'
      sortedNodes = currentNode.dependsOn.map(key => nodeMap[key]).reduce(visit, sortedNodes)
      currentNode.__status = 'complete'
      return [currentNode].concat(sortedNodes)
    }
    return sortedNodes
  }

  return nodes
    .map(node => ({...node, __status: 'inactive'}))
    .reduce(visit)
    .map(({__status, ...node}) => node) // eslint-disable-line no-unused-vars
}

export const enhanceReducer = reducer => {
  let selectors = reducer.__REDUX_PLUS$selectorStats || []
  if (!reducer.__REDUX_PLUS$isSelector) return reducer
  // normalize paths
  selectors = selectors.map(selector => ({
    ...selector,
    path: _.toPath(selector.path).join('.'),
    dependsOn: selector.dependsOn.map(_dependency => {
      const dependency = typeof _dependency === 'function' ? _dependency() : _dependency // TODO: add local/global state arguments
      if (typeof dependency !== 'string') {
        console.error(`Dependency must be a string or return a string (${selector.path})`, _dependency)
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
        _.set(newState, path, selector(newState, path)),
      reducer(state, action)
    ))
}

export const selectorEnhancer = next => (reducer, ...args) => {
  reducer = enhanceReducer(reducer)

  return next(reducer, ...args)
}
