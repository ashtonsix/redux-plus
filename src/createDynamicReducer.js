import {addMetadata} from './helpers/addMetadata'

// TODO: should throw error if dynamicReducer does not return reducer
// TODO: returned reducer should have meta.isGenerated = true
// const getPath = (meta, path = '') => {
//   if (!meta.parent) return path
//   return getPath(meta.parent, `${meta.name}.${path}`)
// }
//
// function DynamicReducerError(message) {
//   this.name = 'DynamicReducerError'
//   this.message = message
//   this.stack = (new Error()).stack
// }
//
// const typeCheckDynamic = (f, path) => {
//   const meta = f.meta
//   f = (...args) => {
//     const result = f(...args)
//     if (typeof result !== 'function') {
//       throw new DynamicReducerError(`${path} should return a reducer`)
//     }
//     if (!result.meta) addMetadata(result)
//     result.meta.isGenerated = true
//     return result
//   }
//   if (meta) f.meta = meta
//   return f
// }

export const createDynamicReducer = f => {
  if (!f.meta) addMetadata(f)

  // const path = getPath(f.meta)
  // if (f.meta.selector) f.meta.selector.reducer = typeCheckDynamic(f.meta.selector.reducer, path)
  // else f = typeCheckDynamic(f, path)

  f.meta.isDynamic = true
  return f
}
