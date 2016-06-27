export const defaultGetter = (state, key) =>
  state['@@__IMMUTABLE_ITERABLE__@@'] ?
    state.get(key) :
    state[key]
