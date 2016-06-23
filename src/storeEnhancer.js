import {compose} from 'redux'
import {dispatchEnhancer} from './enhancers/dispatchEnhancer'
import {effectEnhancer} from './enhancers/effectEnhancer'
import {selectorEnhancer} from './enhancers/selectorEnhancer'

export const storeEnhancer = compose(
  dispatchEnhancer,
  selectorEnhancer,
  effectEnhancer,
)
