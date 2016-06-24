import {getModel} from '../getModel'

// TODO: make cache length configurable & accessible
export const defaultMemoize = (func, ignore = []) => {
  const cache = {
    args: undefined,
    result: undefined,
  }

  const newFunc = (...args) => {
    if (!cache.args || args.some((v, i) => (cache.args[i] !== v) && !ignore[i])) {
      cache.args = args
      const result = func(...args)
      cache.result = getModel(result)
      return result
    }
    return cache.result
  }
  newFunc.cache = cache

  return newFunc
}
