import xr from 'xr'
import {createEffect} from '../createEffect'

export const api = (method, url, config = {}, reducer = s => s) => (state, action) => {
  config = typeof config === 'function' ? config(action) : config

  return createEffect(
    reducer(state, action),
    () =>
      xr({
        [config.method === 'GET' ? 'params' : 'data']: action.payload,
        method, url, ...config})
      .then(
        response => ({
          type: `${action.type}_SUCCESS`, payload: response.data,
          meta: {response, originalAction: action}}),
        error => ({type: `${action.type}_FAILURE`, payload: error})))
}
