export const dispatchEnhancer = next => (reducer, ...args) => {
  const store = next(reducer, ...args)
  const _dispatch = store.dispatch
  store.dispatch = (action, payload = null) => {
    const newAction = typeof action === 'string' ? {type: action, payload} : action
    return _dispatch(newAction)
  }
  return store
}
