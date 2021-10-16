import { isCsvLoader, isCustomLoader, isConfiguration } from '../../src/loader/types'
import testTypeGuardFunc from '../testTypeGuard.helper'

describe('lader/types', () => {
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
      fields: [{
        name: 'field',
        type: 'string'
      }]
    }],
    loaders: [{
      custom: 'loader.js'
    }]
  }, {
    serve: 3000,
    storage: 'sqlite',
    types: [],
    loaders: [{
      $type: '$tag',
      csv: 'tags.csv'
    }]
  }], [
    undefined, null, false, true, '', 0, {}, new Date(), {
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
