/* eslint func-names:0, prefer-arrow-callback:0 */

import expect from 'expect'
import {createStore, createSelector, createReducer, combineReducers} from '../../src/index'

describe('combineReducers', function () {
  describe('simpleStore', function () {
    let counterHandlers
    let reducer
    let store

    beforeEach(function () {
      counterHandlers = {
        INCREMENT: state => state + 1,
        DECREMENT: state => state - 1,
      }

      reducer = combineReducers({
        counter: createReducer(counterHandlers, 0),
        counterDoubled: createSelector(
          'counter',
          (state, counter) => counter * 2),
      })

      store = createStore(reducer)
    })

    it('should compute state on initialization', function () {
      expect(store.getState()).toEqual({
        counter: 0,
        counterDoubled: 0,
      })
    })

    it('should update computed state when actions run', function () {
      store.dispatch('INCREMENT')
      expect(store.getState()).toEqual({
        counter: 1,
        counterDoubled: 2,
      })
    })
  })

  describe('chainedAndNestedStore', function () {
    let counterHandlers
    let reducer
    let store

    beforeEach(function () {
      counterHandlers = {
        INCREMENT: state => state + 1,
        DECREMENT: state => state - 1,
      }

      reducer = combineReducers({
        counter: createReducer(counterHandlers, 0),
        nested: combineReducers({
          counterDoubled: createSelector(
            'counter',
            (state, counter) => counter * 2),
        }),
        counterTripled: createSelector(
          combineReducers({
            nested: createSelector(
              'nested.counterDoubled',
              (state, counter) => counter * 1.5),
          })),
        counterHalved: createSelector(
          'counterTripled.nested',
          (state, counter) => counter / 6),
      })

      store = createStore(reducer)
    })

    it('should compute state on initialization', function () {
      expect(store.getState().counterHalved).toBe(0)
    })

    it('should update computed state when actions run', function () {
      store.dispatch('INCREMENT')
      expect(store.getState().counterHalved).toBe(0.5)
      store.dispatch('INCREMENT')
      expect(store.getState().counterHalved).toBe(1)
    })
  })
})
