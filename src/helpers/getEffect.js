export const getEffect = effect =>
  (effect && effect.isEffect) ? effect[1] : []
