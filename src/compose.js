import {compose as _compose} from 'redux'

export const compose = (...args) => {
  const storeEnhancer = _compose(...args)
  // flag for createStore
  storeEnhancer.__REDUX_PLUS$isStoreEnhancer =
    args.some(arg => arg.__REDUX_PLUS$isStoreEnhancer)

  return storeEnhancer
}
