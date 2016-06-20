/* eslint func-names:0, prefer-arrow-callback:0 */

import expect from 'expect'
import {createStore} from '../src/index'

describe('createStore', function () {
  let spyTargets
  let reducer
  let store

  beforeEach(function () {
    spyTargets = {
      reducer: () => {},
    }

    reducer = (state, action) => {
      spyTargets.reducer()
      return {prevAction: action}
    }

    store = createStore(reducer)
  })

  it('should call the reducer when an action is dispatched', function () {
    const reducerSpy = expect.spyOn(spyTargets, 'reducer')
    store.dispatch({type: 'GET_DATA'})
    expect(reducerSpy).toHaveBeenCalled()
  })

  it("should update it's state when an action is dispatched", function () {
    store.dispatch({type: 'GET_DATA'})
    expect(store.getState().prevAction).toEqual({type: 'GET_DATA'})
    store.dispatch({type: 'UPDATE_LIST'})
    expect(store.getState().prevAction).toEqual({type: 'UPDATE_LIST'})
  })

  it('should convert strings to actions', function () {
    store.dispatch('GET_DATA', {url: '/data'})
    expect(store.getState().prevAction).toEqual({type: 'GET_DATA', payload: {url: '/data'}})
    store.dispatch('UPDATE_LIST')
    expect(store.getState().prevAction).toEqual({type: 'UPDATE_LIST', payload: null})
  })
})
