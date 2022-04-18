import { isCsvLoader, isCustomLoader, isConfiguration } from './types'
import testTypeGuardFunc from '../testTypeGuard.test'

describe('loader/types', () => {
  testTypeGuardFunc('isCsvLoader', isCsvLoader, [{
    $type: 'record',
    csv: 'file.csv'
  }, {
    $type: 'record',
    csv: 'file.csv',
    separator: ';'
  }, {
    $type: 'record',
    csv: 'file.csv',
    tagSeparator: ' '
  }, {
    $type: 'record',
    csv: 'file.csv',
    separator: ';',
    tagSeparator: ','
  }], [
    undefined, null, false, true, '', 0, {}, new Date()
  ])

  testTypeGuardFunc('isCustomLoader', isCustomLoader, [{
    custom: 'loader.js'
  }], [
    undefined, null, false, true, '', 0, {}, new Date()
  ])

  testTypeGuardFunc('isConfiguration', isConfiguration, [{
    storage: 'memory',
    types: [{
      name: 'record',
      selectOrder: 0,
      fields: [{
        name: 'field',
        type: 'string'
      }]
    }],
    loaders: [{
      custom: 'loader.js'
    }]
  }], [
    undefined, null, false, true, '', 0, {}, new Date(), {
      serve: 3000,
      storage: 'sqlite',
      types: [],
      loaders: [{
        $type: '$tag',
        csv: 'tags.csv'
      }]
    }, {
      storage: 'sqlite',
      loaders: [{
        $type: '$tag',
        csv: 'tags.csv'
      }]
    }, {
      storage: 'sqlite',
      types: [],
      loaders: [{
      }]
    }, {
      storage: 'unknown',
      types: [],
      loaders: [{
        $type: '$tag',
        csv: 'tags.csv'
      }]
    }
  ])
})
