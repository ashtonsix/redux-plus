import _ from 'lodash'
import {createEffect} from '../createEffect'

export const log = (method = 'log', transformer = 'payload') => (state, action) => {
  const result =
    typeof transformer === 'function' ?
      transformer(action) :
    transformer ?
      _.get(action, transformer) :
      action
  return createEffect(state, () => console[method](result))
}
