import {compose} from 'redux'
import {dispatchEnhancer, effectEnhancer, selectorEnhancer} from './enhancers'

const storeEnhancer = compose(
  dispatchEnhancer,
  selectorEnhancer,
  effectEnhancer,
)

export {storeEnhancer}
