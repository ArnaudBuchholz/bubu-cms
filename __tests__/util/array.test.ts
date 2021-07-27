import { join } from '../../src/util/array'

describe('util/array', () => {
  describe('join', () => {
    it('allows empty arrays', () => expect(join([], [])).toEqual([]))
    it('allows empty arrays (array1 empty)', () => expect(join([], ['a', 'b'])).toEqual(['a', 'b']))
    it('allows empty arrays (array2 empty)', () => expect(join(['a', 'b'], [])).toEqual(['a', 'b']))
    it('joins the arrays and keeps unique values', () => expect(join(['a', 'c'], ['a', 'b'])).toEqual(['a', 'c', 'b']))
  })
})
