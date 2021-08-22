import { isSortableField } from '../../src/types/IStorage'

describe('types/IStorage', () => {
  describe('isSortableField', () => {
    interface ITest {
      value: string
      expected: boolean
    }

    const tests: ITest[] = [{
      value: 'name',
      expected: true
    }, {
      value: 'rating',
      expected: true
    }, {
      value: 'touched',
      expected: true
    }, {
      value: '',
      expected: false
    }, {
      value: 'any',
      expected: false
    }]

    tests.forEach((test: ITest) => {
      it(`${test.value}: ${test.expected.toString()}`, () => {
        expect(isSortableField(test.value)).toEqual(test.expected)
      })
    })
  })
})
