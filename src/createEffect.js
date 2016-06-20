export const createEffect = (state, ...effects) => {
  const effect = [state, effects]
  effect.isEffect = true
  return effect
}
