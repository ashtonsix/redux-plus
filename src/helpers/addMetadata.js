import _ from 'lodash'

const defaultGetter = (state, key) => state[key]
const defaultSetter = (state, key, value) => ({
  ...state,
  [key]: value,
})

export const addMetadata = (reducer, children = {}, options = {}) => {
  const {getter = defaultGetter, setter = defaultSetter} = options

  reducer.meta = {
    reducer,
    get(state, key) {
      key = _.toPath(key)
      const result = getter(state, key[0])
      if (key.length === 1) return result
      return reducer.children[key].get(result, key.slice(1))
    },
    set(state, key, value) {
      key = _.toPath(key)
      if (key.length === 1) return setter(state, key[0], value)
      return setter(
        state, key[0],
        reducer.children[key].set(
          getter(state, key[0]), key.slice(1), value))
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
