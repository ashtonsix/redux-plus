/*
Example:
createReducer({
  INCREMENT: state => state + 1
  INCREMENT_IN_5_SECONDS: wait(5000, () => 'INCREMENT')
})
 */

import {createEffect} from '../index'

export const wait = (delay, func) => (state, action) =>
  createEffect(
    state,
    () => new Promise(resolve => setTimeout(() =>
      resolve(func(state, action)),
      delay)))
