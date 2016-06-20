export const createReducer = (reducerMap, defaultState) => (state = defaultState, action) => {
  const reducer = reducerMap[action.type] || (s => s)
  return reducer(state, action)
}
