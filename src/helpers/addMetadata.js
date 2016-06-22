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

export const addMetadata = (reducer, children = {}, options = {}) => {
  const {getter = defaultGetter, setter = defaultSetter} = options

  reducer.meta = {
    reducer,
    get(state, key) {
      key = _.toPath(key).filter(v => v)
      const result = getter(state, key[0])
      if (key.length === 1) return result
      const childGetter = _.get(reducer, ['children', key, 'get'])
      return (childGetter || reducer.meta.get)(result, key.slice(1))
    },
    set(state, key, value) {
      key = _.toPath(key).filter(v => v)
      if (key.length === 1) return setter(state, key[0], value)
      const childSetter = _.get(reducer, ['children', key, 'set'])
      const result = (childSetter || reducer.meta.set)(getter(state, key[0]), key.slice(1), value)
      return setter(state, key[0], result)
    },
    traverse(visitor, path = []) {
      if (!reducer) return
      const meta = reducer.meta || reducer
      visitor(meta, path)
      _.mapValues(
        meta.children,
        (child, childName) =>
          child.traverse(visitor, path.concat(childName)))
    },
  }

  reducer.meta.children = _.mapValues(children, child => {
    if (!child.meta) addMetadata(child)
    return _.set(child.meta, 'parent', reducer.meta)
  })

  return reducer
}
