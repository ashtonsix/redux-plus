/* eslint func-names:0, prefer-arrow-callback:0 */

import expect from 'expect'
import {plus, compose} from '../src/index'

describe('compose', function () {
  it('should inherit isStoreEnhancer flag from storeEnhancer', function () {
    expect(compose(plus).__REDUX_PLUS$isStoreEnhancer).toExist()
  })
})
