import _ from 'lodash'
import {createEffect} from '../createEffect'

export const createTransformer = transformerMap => (state, action) => {
  // If action.type = [AUTH]_LOGIN(FOO, BAR) then
  // transformers = [transformerMap[AUTH], transformerMap[FOO], transformerMap[BAR]]
  let transformers = _.flatten(
    (action.type.match(/[\[\(][\w\s,]+[\]\)]/g) || [])
      .map(v => v.slice(1, -1).split(','))
  ).map(key => transformerMap[key.trim()])

  if (!transformers.length) return state

  // If action.type = [AUTH]_LOGIN(FOO, BAR) then
  // actionTypeTransformer(action).type = AUTH_LOGIN
  const actionTypeTransformer = _action => ({
    ..._action,
    type: action.type
      .replace(/[\[\]]/g, '')
      .replace(/\([\w\s,]+\)/g, '')})

  transformers = [actionTypeTransformer].concat(transformers)

  // [transformer1, transformer2] becomes transformer2(transformer1(action))
  return createEffect(
    state,
    transformers.reduce((newAction, transformer) => transformer(newAction), action)
  )
}
