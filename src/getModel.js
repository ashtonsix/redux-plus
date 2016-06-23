export const getModel = effect =>
  (effect && effect.isEffect) ? effect[0] : effect
