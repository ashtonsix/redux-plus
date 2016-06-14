import _ from 'lodash'
import {createStore as _createStore} from 'redux'
import {storeEnhancer as _storeEnhancer} from './storeEnhancer'
import {compose} from './compose'

export const createStore = (reducer, storeEnhancer, options) => {
  if (typeof storeEnhancer !== 'function') {
    options = storeEnhancer
    storeEnhancer = _storeEnhancer
  }

  if (!storeEnhancer.__REDUX_PLUS$isStoreEnhancer) {
    storeEnhancer = compose(
      _storeEnhancer,
      storeEnhancer
    )
  }

  return _createStore(reducer, _.get(options, 'initialState'), storeEnhancer)
}
