export const defaultGetter = (state, key) =>
  !state ?
    null :
  state['@@__IMMUTABLE_ITERABLE__@@'] ?
    state.get(key) :
    state[key]
