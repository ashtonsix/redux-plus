/* eslint func-names:0, prefer-arrow-callback:0 */

import expect from 'expect'
import {createStore, createEffect, createReducer, combineReducers} from '../src/index'

describe('combineReducers', function () {
  let spyTargets
  let dataHandlers
  let counterHandlers
  let reducer
  let store

  beforeEach(function () {
    const api = () => Promise.resolve({status: 200, data: 'Only Jack returned.'})

    spyTargets = {
      getData: () => api('/data').then(({data}) => ({type: 'GET_DATA_SUCCESS', payload: data})),
    }

    dataHandlers = {
      GET_DATA: state => createEffect(
        state,
        spyTargets.getData
      ),
      GET_DATA_SUCCESS: (state, {payload}) => payload,
    }

    counterHandlers = {
      INCREMENT: state => state + 1,
      DECREMENT: state => state - 1,
    }

    reducer = combineReducers({
      data: createReducer(dataHandlers, 'Jack and Jill went up the hill.'),
      counter: createReducer(counterHandlers, 0),
    })

    store = createStore(reducer)
  })

  it('should initialize with nested state', function () {
    expect(store.getState()).toEqual({
      data: 'Jack and Jill went up the hill.',
      counter: 0,
    })
  })

  it('should run effects that nested actions return', function () {
    const effectSpy = expect.spyOn(spyTargets, 'getData')
    store.dispatch('GET_DATA')
    expect(effectSpy).toHaveBeenCalled()
  })

  it('should dispatch actions from nested effects', function (done) {
    const successSpy = expect.spyOn(dataHandlers, 'GET_DATA_SUCCESS')
    store.dispatch('GET_DATA')
    expect(successSpy).toNotHaveBeenCalled()
    setTimeout(() => {
      expect(successSpy).toHaveBeenCalled()
      done()
    })
  })

  it('should update nested state when actions run', function (done) {
    expect(store.getState().counter).toBe(0)
    store.dispatch('INCREMENT')
    expect(store.getState().counter).toBe(1)
    store.dispatch('INCREMENT')
    expect(store.getState().counter).toBe(2)
    store.dispatch('DECREMENT')
    expect(store.getState().counter).toBe(1)

    expect(store.getState().data).toBe('Jack and Jill went up the hill.')
    store.dispatch('GET_DATA')
    setTimeout(() => {
      expect(store.getState().data).toBe('Only Jack returned.')
      done()
    })
  })
})
