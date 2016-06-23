import _ from 'lodash'

function AcyclicError(message) {
  this.name = 'AcyclicError'
  this.message = message
  this.stack = (new Error()).stack
}

export const topologicalSort = nodes => {
  const nodeMap = _.fromPairs(nodes.map(node => [node.path, node]))
  const visit = (sortedNodes, currentNode, path = []) => {
    if (currentNode.__status === 'active') {
      throw new AcyclicError(`Selector has circular dependency (${[...path, currentNode.path].join(' -> ')})`)
    }
    if (currentNode.__status === 'inactive') {
      currentNode.__status = 'active'
      // Consider a node to depend on every ascendant of a dependency,
      // this is for dynamic & nested reducers
      sortedNodes = _.flatten(
        currentNode.selector.dependencies.map(
          key => key.split('.').map((v, i, arr) => arr.slice(0, i + 1)).map(v => v.join('.')))
      ).map(key => nodeMap[key]).filter(n => n)
        // path is for easier to debug AcyclicError messages
        .reduce(
          (...args) => visit(...args, [...path, _.toPath(currentNode.path).join('.')]),
          sortedNodes
        )
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
