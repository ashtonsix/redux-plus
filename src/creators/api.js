/**
 * An easy way to create api request in reducers
 * Superset of promise
 *
 * api('POST', '/api/endpoint')
 * api('POST', '/api/endpoint', {headers: {Authentication: 'password'}})
 * api({method: 'POST', url: '/api/endpoint', headers: {Authentication: 'password'}})
 * api((state, {payload}) => xr.post('/api/endpoint', payload))
 * api('POST', '/api/endpoint', (state) => ({counter: state.counter + 1, ...state}))
 */

import xr from 'xr'
import {getModel} from '../helpers/getModel'
import {createEffect} from '../index'

const generateRequest = (config) =>
  typeof config === 'function' ? config :
    (state, {payload}) =>
      xr({[config.method === 'GET' ? 'params' : 'data']: payload, ...config})

const _api = (requestConfig, reducer = getModel) => (state, action) => {
  const effect = () =>
    generateRequest(requestConfig)(state, action).then(
      response => ({type: `${action.type}_SUCCESS`, payload: response.data, meta: {response}}),
      error => ({type: `${action.type}_FAILURE`, payload: error}))
  return createEffect(reducer(state, action), effect)
}

export const api = (...args) =>
  typeof args[0] === 'string' && typeof args[1] === 'string' ?
    typeof args[2] !== 'function' ?
      _api({method: args[0], url: args[1], ...args[2]}, args[3]) :
      _api({method: args[0], url: args[1]}, args[2]) :
    _api(...args)
