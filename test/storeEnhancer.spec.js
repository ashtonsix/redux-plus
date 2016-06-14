/* eslint func-names:0, prefer-arrow-callback:0 */

import expect from 'expect'
import {plus} from '../src/index'

describe('storeEnhancer', function () {
  it('should have isStoreEnhancer flag', function () {
    expect(plus.__REDUX_PLUS$isStoreEnhancer).toExist()
  })
})
