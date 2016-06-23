import {getModel} from '../getModel'

// TODO: make cache length configurable & accessible
export const defaultMemoize = func => {
  const cache = {
    args: undefined,
    result: undefined,
  }

  return (...args) => {
    if (!cache.args || args.some((v, i) => cache.args[i] !== v)) {
      cache.args = args
      const result = func(...args)
      cache.result = getModel(cache)
      return result
    }
    return cache.result
  }
}
