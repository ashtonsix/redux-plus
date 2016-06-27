export const defaultSetter = (state, key, value) => {
  if (state['@@__IMMUTABLE_ITERABLE__@@']) {
    return state.set(key, value)
  }
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
