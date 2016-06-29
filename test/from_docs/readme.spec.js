/* eslint func-names:0, prefer-arrow-callback:0 */

import expect from 'expect'
const {
  createStore, createSelector, createReducer, createEffect, combineReducers,
} = require(`../../${process.env.NODE_ENV === 'production' ? 'modules' : 'src'}/index`)

describe('usage', function () {
  let reducer
  let store

  beforeEach(function () {
    reducer = combineReducers({
      counter: createReducer({
        INCREMENT: state => state + 1,
        INCREMENT_IN_5_MILLISECONDS: state => createEffect(
          state,
          () => new Promise(resolve => setTimeout(() =>
            resolve('INCREMENT'),
            5))
        ),
      }, 0),
      counterDoubled: createSelector(
        'counter',
        (state, counter) => counter * 2),
    })

    store = createStore(reducer)
  })

  it('should update state correctly', function (done) {
    expect(store.getState()).toEqual({counter: 0, counterDoubled: 0})
    store.dispatch('INCREMENT')
    expect(store.getState()).toEqual({counter: 1, counterDoubled: 2})
    store.dispatch('INCREMENT_IN_5_MILLISECONDS')
    expect(store.getState()).toEqual({counter: 1, counterDoubled: 2})
    setTimeout(
      () => {
        expect(store.getState()).toEqual({counter: 2, counterDoubled: 4})
        done()
      },
      6)
  })
})
