export const getGenerators = effect =>
  (effect && effect.isEffect) ? effect[1] : []
