/**
 * An easy way to create promises in reducers
 *
 * promise((state, {payload}) => xr.post('/api/endpoint', payload))
 */

import {getModel} from '../helpers/getModel'
import {createEffect} from '../index'

export const promise = (promiseGenerator, reducer = getModel) => (state, action) => {
  const effect = () =>
    Promise.resolve(promiseGenerator(state, action)).then(
      success => ({type: `${action.type}_SUCCESS`, payload: success, meta: {success}}),
      failure => ({type: `${action.type}_FAILURE`, payload: failure}))
  return createEffect(reducer(state, action), effect)
}
