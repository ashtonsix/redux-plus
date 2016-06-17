import {createStore as _createStore} from 'redux'
import {storeEnhancer as _storeEnhancer} from './storeEnhancer'

export const createStore = (reducer, initialState, storeEnhancer) => {
  if (typeof initialState === 'function') {
    storeEnhancer = initialState
    initialState = undefined
  }

  return _createStore(reducer, initialState, storeEnhancer || _storeEnhancer)
}
