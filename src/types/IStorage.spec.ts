import {
  checkSortableField,
  isSortableField,
  checkSortingOptions,
  isSortingOptions
} from './IStorage'
import { testType } from '../testTypeGuard.test'

describe('types/IStorage', () => {
  const invalidValues = ['undefined', null, false, true, {}, Symbol('whatever'), function () {}, '']

  testType('SortableField', { is: isSortableField, check: checkSortableField }, [
    'name', 'rating', 'touched'
  ], [
    ...invalidValues, 'any'
  ])

  testType('SortingOptions', { is: isSortingOptions, check: checkSortingOptions }, [{

  }], [
    ...invalidValues, 'any'
  ])
})
