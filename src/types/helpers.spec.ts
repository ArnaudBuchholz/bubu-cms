import {
  checkLiteralObject,
  isLiteralObject
} from './helpers'
import { testType } from '../testTypeGuard.test'

describe('types/helpers', () => {
  testType('LiteralObject', { is: isLiteralObject, check: checkLiteralObject }, [
    {}, { test: true }
  ], [
    'undefined', null, false, true, Symbol('whatever'), function () {}, ''
  ])

  describe('LiteralObject with members', () => {
    it('validates required members', () => {
      expect(() => checkLiteralObject({
        a: true
      }, { a: true })).not.toThrow()
    })

    it('validates optional members', () => {
      expect(() => checkLiteralObject({
      }, { a: false })).not.toThrow()
    })

    it('reject extra members', () => {
      expect(() => checkLiteralObject({
        b: false
      }, { a: false })).toThrow()
    })
  })
})
