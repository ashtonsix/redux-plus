import _ from 'lodash'
import {addMetadata} from './helpers/metadata'

const getPath = (meta, path = '') => {
  if (!meta.parent) return path
  return getPath(meta.parent, `${meta.name}.${path}`)
}

function DynamicReducerError(message) {
  this.name = 'DynamicReducerError'
  this.message = message
  this.stack = (new Error()).stack
}

export const createDynamicReducer = child => {
  if (!child.meta) addMetadata(child)
  const func = _.get(child, 'meta.selector.reducer', child)

  // DynamicReducers have their own cache. Technically this means the reducer mutates itself when called.
  // One possible side-effect of this is losing referential integrity after replacing store reducer.
  let previousState
  const newFunc = (state, action) => {
    const result = child.meta.selector ?
      func(state, action, previousState) :
      func(previousState, action)
    if (typeof result !== 'function') {
      throw new DynamicReducerError(`${getPath(child.meta)} should return a reducer`)
    }
    if (!result.meta) addMetadata(result)
    result.meta.isGenerated = true
    previousState = result
    return result
  }

  if (child.meta.selector) {
    child.meta.selector.reducer = newFunc
  } else {
    const meta = child.meta
    child = newFunc
    child.meta = meta
    child.meta.reducer = child
  }

  child.meta.isDynamic = true
  return child
}
