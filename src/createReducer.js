export const createReducer = (reducers, defaultState) => (state, action) => {
  if (state === undefined) state = defaultState
  const reducer = reducers[action.type] || (s => s)
  return reducer(state, action)
}
