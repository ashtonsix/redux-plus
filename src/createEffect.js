export const createEffect = (state, ...generators) => {
  const effect = [state, generators]
  effect.isEffect = true
  return effect
}
