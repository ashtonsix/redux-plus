import {loop, Effects} from 'redux-loop'

export const createEffect = (state, ...effects) =>
  loop(state, Effects.batch(effects.map(e => Effects.promise(() =>
    Promise.resolve(typeof e === 'function' ? e() : e))
  )))
