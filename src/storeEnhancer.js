import {compose} from 'redux'
import {dispatchEnhancer, effectEnhancer, selectorEnhancer} from './enhancers'

export const storeEnhancer = compose(
  dispatchEnhancer,
  selectorEnhancer,
  effectEnhancer,
)
