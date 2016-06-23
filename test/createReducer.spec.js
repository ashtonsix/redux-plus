/* eslint func-names:0, prefer-arrow-callback:0 */

import expect from 'expect'
const {createReducer} = require(`../${process.env.NODE_ENV === 'production' ? 'dist' : 'src'}/index`)

describe('createReducer', function () {
  let handlers
  let reducer

  beforeEach(function () {
    handlers = {
      INCREMENT: state => state + 1,
      DECREMENT: state => state - 1,
    }

    reducer = createReducer(handlers, 0)
  })

  it('should call correct handlers when invoked', function () {
    const incrementSpy = expect.spyOn(handlers, 'INCREMENT')
    const decrementSpy = expect.spyOn(handlers, 'DECREMENT')
    reducer(0, {type: 'INCREMENT'})
    expect(incrementSpy).toHaveBeenCalled()
    expect(decrementSpy).toNotHaveBeenCalled()
  })

  it('should return updated state', function () {
    let state = 0
    state = reducer(state, {type: 'INCREMENT'})
    expect(state).toBe(1)
    state = reducer(state, {type: 'INCREMENT'})
    expect(state).toBe(2)
    state = reducer(state, {type: 'DECREMENT'})
    expect(state).toBe(1)
  })
})
