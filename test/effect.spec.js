/* eslint func-names:0, prefer-arrow-callback:0 */

import expect from 'expect'
import {createStore, createEffect, createReducer} from '../src/index'

describe('effect', function () {
  let api
  let handlers
  let reducer
  let store
  let spyTargets

  beforeEach(function () {
    api = () => Promise.resolve({status: 200, data: "It's coming for you. Watch out."})

    spyTargets = {
      getData: () => api('/data').then(({data}) => ({type: 'GET_DATA_SUCCESS', payload: data})),
      reducer: () => {},
    }

    handlers = {
      GET_DATA: state => createEffect(
        state,
        spyTargets.getData
      ),
      GET_DATA_CONSTANT: state => createEffect(
        state,
        {type: 'GET_DATA_SUCCESS', payload: "Don't worry. You're safe now."}
      ),
      GET_DATA_SUCCESS: (state, {payload}) => payload,
      DUD_EFFECTS: state => createEffect(
        state,
        null,
        undefined,
        () => null,
        () => Promise.resolve(undefined),
      ),
      BATCH_EFFECTS: state => createEffect(
        state,
        {type: 'ACTION_1'},
        () => ({type: 'ACTION_2'}),
        () => Promise.resolve({type: 'ACTION_3'})
      ),
      ACTION_1: state => state,
      ACTION_2: state => state,
      ACTION_3: state => state,
    }

    const _reducer = createReducer(handlers, "There's a monster hiding in the shadows.")
    reducer = (...args) => {
      spyTargets.reducer()
      return _reducer(...args)
    }
    store = createStore(reducer)
  })

  it('should run effects that actions return', function () {
    const effectSpy = expect.spyOn(spyTargets, 'getData')
    store.dispatch('GET_DATA')
    expect(effectSpy).toHaveBeenCalled()
  })

  it('should dispatch actions from effects asynchronously', function (done) {
    const successSpy = expect.spyOn(handlers, 'GET_DATA_SUCCESS')
    store.dispatch('GET_DATA')
    expect(successSpy).toNotHaveBeenCalled()
    setTimeout(() => {
      expect(successSpy).toHaveBeenCalled()
      successSpy.reset()
      store.dispatch('GET_DATA_CONSTANT')
      expect(successSpy).toNotHaveBeenCalled()
      setTimeout(() => {
        expect(successSpy).toHaveBeenCalled()
        done()
      })
    })
  })

  it('should update state when actions run', function (done) {
    expect(store.getState()).toBe("There's a monster hiding in the shadows.")
    store.dispatch('GET_DATA')
    setTimeout(() => {
      expect(store.getState()).toBe("It's coming for you. Watch out.")
      store.dispatch('GET_DATA_CONSTANT')
      setTimeout(() => {
        expect(store.getState()).toBe("Don't worry. You're safe now.")
        done()
      })
    })
  })

  it("shouldn't dispatch anything if effects evaluate to null", function (done) {
    store.dispatch('DUD_EFFECTS')
    const reducerSpy = expect.spyOn(spyTargets, 'reducer')
    setTimeout(() => {
      expect(reducerSpy).toNotHaveBeenCalled()
      done()
    })
  })

  it('should dispatch multiple actions if multiple effects are returned', function (done) {
    const actionSpies = ['ACTION_1', 'ACTION_2', 'ACTION_3'].map(key => expect.spyOn(handlers, key))
    store.dispatch('BATCH_EFFECTS')
    const reducerSpy = expect.spyOn(spyTargets, 'reducer')
    setTimeout(() => {
      expect(reducerSpy).toHaveBeenCalled()
      actionSpies.forEach(spy => expect(spy).toHaveBeenCalled())
      done()
    })
  })
})
