import {createStore as _createStore} from 'redux'
import {storeEnhancer as _storeEnhancer} from './storeEnhancer'
import {compose} from './compose'

export const createStore = (reducer, initialState, storeEnhancer) => {
  if (typeof initialState === 'function') {
    storeEnhancer = initialState
    initialState = undefined
  }

  storeEnhancer = storeEnhancer || _storeEnhancer

  if (!storeEnhancer.__REDUX_PLUS$isStoreEnhancer) {
    storeEnhancer = compose(
      _storeEnhancer,
      storeEnhancer
    )
  }

  return _createStore(reducer, initialState, storeEnhancer)
}
