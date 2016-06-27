/* eslint func-names:0, prefer-arrow-callback:0 */

import expect from 'expect'
const {
  createStore, createSelector, createReducer, createEffect, combineReducers,
} = require(`../${process.env.NODE_ENV === 'production' ? 'modules' : 'src'}/index`)

describe('createSelector', function () {
  const counterHandlers = {
    INCREMENT: state => state + 1,
    DECREMENT: state => state - 1,
  }

  describe('simpleStore', function () {
    let reducer
    let store

    beforeEach(function () {
      reducer = combineReducers({
        counter: createReducer(counterHandlers, 0),
        counterDoubled: createSelector(
          'counter',
          (state, counter) => counter * 2),
      })

      store = createStore(reducer)
    })

    it('should compute state on initialization', function () {
      expect(store.getState()).toEqual({counter: 0, counterDoubled: 0})
    })

    it('should update computed state when actions run', function () {
      store.dispatch('INCREMENT')
      expect(store.getState()).toEqual({counter: 1, counterDoubled: 2})
    })
  })

  describe('chainedAndNestedStore', function () {
    let reducer
    let store

    beforeEach(function () {
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

    it("should use cached state if the underlying data doesn't change", function () {
      const counterDoubled = store.getState().counterDoubled
      store.dispatch('SOME_RANDOM_ACTION')
      expect(store.getState().counterDoubled).toBe(counterDoubled)
    })
  })

  describe('computationsThatReturnEffects', function () {
    let effectHandlers
    let reducer
    let store

    beforeEach(function () {
      effectHandlers = {
        COUNTER_CHANGED: state => state,
      }

      reducer = combineReducers({
        counter: createReducer(counterHandlers, 0),
        counterUpdater: createSelector(
          'counter',
          state => createEffect(state, 'COUNTER_CHANGED')),
        counterResponder: createReducer(effectHandlers),
      })

      store = createStore(reducer)
    })

    it('should dispatch actions from effects asynchronously', function (done) {
      const successSpy = expect.spyOn(effectHandlers, 'COUNTER_CHANGED')
      store.dispatch('INCREMENT')
      expect(successSpy).toNotHaveBeenCalled()
      setTimeout(() => {
        expect(successSpy).toHaveBeenCalled()
        done()
      })
    })
  })

  describe('dynamicSelector', function () {
    let reducer
    let store
    beforeEach(function () {
      reducer = combineReducers({
        todos: createReducer({
          ADD_TODO: (state, {payload}) => state.concat(payload),
          UPDATE_LAST_TODO: (state, {payload}) => {
            state[state.length - 1] = payload
            return state
          },
        }, ['Kill her']),
        lastTodo: createSelector(
          ['todos', (state, todos) => `todos.${todos.length - 1}`],
          (state, todo) => todo),
      })

      store = createStore(reducer)
    })

    it('should initialize with correct state', function () {
      expect(store.getState().lastTodo).toBe('Kill her')
    })

    it('should update state when actions are dispatched', function () {
      store.dispatch('ADD_TODO', 'Hide the evidence')
      expect(store.getState().lastTodo).toBe('Hide the evidence')
      store.dispatch('UPDATE_LAST_TODO', 'Put her in the trunk')
      expect(store.getState().lastTodo).toBe('Put her in the trunk')
    })
  })

  // TODO: Add test to confirm AcyclicError is thrown correctly
})
