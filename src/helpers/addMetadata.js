// Working with impure functions like these is anus, my apologies
// It's because function de-referencing / cloning in JS

import _ from 'lodash'

export const defaultGetter = (state, key) => state[key]
export const defaultSetter = (state, key, value) => {
  if (state instanceof Array) {
    state = state.slice()
    state[key] = value
    return state
  }
  return ({
    ...state,
    [key]: value,
  })
}

const get = (reducer, getter) => (state, key) => {
  key = _.toPath(key).filter(v => v)
  const result = getter(state, key[0])
  if (key.length === 1) return result
  const childGetter = _.get(reducer, ['children', key, 'get'])
  return (childGetter || reducer.meta.get)(result, key.slice(1))
}

const set = (reducer, getter, setter) => (state, key, value) => {
  key = _.toPath(key).filter(v => v)
  if (key.length === 1) return setter(state, key[0], value)
  const childSetter = _.get(reducer, ['children', key, 'set'])
  const result = (childSetter || reducer.meta.set)(getter(state, key[0]), key.slice(1), value)
  return setter(state, key[0], result)
}

const traverse = reducer => (visitor, path = []) => {
  if (!reducer) return
  const meta = reducer.meta || reducer
  visitor(meta, path)
  _.mapValues(
    meta.children,
    (child, childName) =>
      child.traverse(visitor, path.concat(childName)))
}

export const addMetadata = (reducer, children = {}, options = {}) => {
  const {getter = defaultGetter, setter = defaultSetter} = options

  if (!reducer.meta) reducer.meta = {}
  reducer.meta.reducer = reducer
  reducer.meta.getter = getter
  reducer.meta.setter = setter
  if (!options.getter) reducer.meta.get = get(reducer, getter)
  if (!options.setter) reducer.meta.set = set(reducer, getter, setter)
  reducer.meta.traverse = traverse(reducer)

  reducer.meta.children = _.mapValues(children, (child, name) => {
    if (!child.meta) addMetadata(child)
    child = _.set(child.meta, 'parent', reducer.meta)
    child.name = name
    return child
  })

  return reducer
}

export const replaceNode = (reducer, path, node) => {
  path = _.toPath(path)
  const meta = reducer.meta || reducer
  if (!path.length) {
    reducer.meta = node
    return reducer
  } else if (path.length === 1) {
    const children = {...meta.children}
    children[path[0]] = node
    return addMetadata(reducer, children)
  }
  const children = {...meta.children}
  reducer = addMetadata(reducer, children)
  replaceNode(reducer.children[path[0]], path.slice(1), node)
  return reducer
}
