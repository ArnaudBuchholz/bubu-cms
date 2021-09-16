import {
  isFieldType,
  MAX_TRANSLATIONKEY_LENGTH,
  MAX_REGEXP_LENGTH,
  isFieldDefinition,
  MAX_TYPENAME_LENGTH,
  isTypeName,
  MAX_DEFAULTICON_LENGTH,
  isDefaultIcon,
  TypeDefinition,
  isTypeDefinition,
  loadTypeDefinition,
  saveTypeDefinition
} from '../../src/types/TypeDefinition'
import { MemoryStorage } from '../../src/storages/memory'
import testTypeGuard from './testTypeGuard.helper'

describe('types/TypeDefinition', () => {
  testTypeGuard('isFieldType', isFieldType, [
    'string', 'number', 'date'
  ], [
    'any', 'float', {}, 1, 0, null, undefined
  ])

  testTypeGuard('isFieldDefinition', isFieldDefinition, [{
    name: 'test1',
    type: 'string'
  }, {
    name: 'test2',
    type: 'number',
    labelKey: 'test.label'
  }, {
    name: 'test3',
    type: 'string',
    regexp: 'a|b|c'
  }, {
    name: 'test4',
    type: 'date',
    placeholderKey: 'test.placeholder'
  }], [{
    name: ' a '
  }, {
    name: 'test'
  }, {
    name: 'test',
    type: 'nope'
  }, {
    name: 'test',
    type: 'string',
    labelKey: ''.padStart(MAX_TRANSLATIONKEY_LENGTH + 1, 'abc.')
  }, {
    name: 'test',
    type: 'string',
    regexp: ''.padStart(MAX_REGEXP_LENGTH + 1, 'abc|')
  }, {
    name: 'test',
    type: 'string',
    placeholderKey: ''.padStart(MAX_TRANSLATIONKEY_LENGTH + 1, 'abc.')
  }, '', {}, 1, 0, null, undefined
  ])

  testTypeGuard('isTypeName', isTypeName, [
    'string', 'number', 'date', 'record', ''.padStart(MAX_TYPENAME_LENGTH, 'abc')
  ], [
    '_any', ' float ', ''.padStart(MAX_TYPENAME_LENGTH + 1, 'abc'), {}, 1, 0, null, undefined
  ])

  testTypeGuard('isDefaultIcon', isDefaultIcon, [
    'a', 'ab', 'abc', ''.padStart(MAX_DEFAULTICON_LENGTH, 'abc')
  ], [
    '', ''.padStart(MAX_DEFAULTICON_LENGTH + 1, 'abc'), {}, 1, 0, null, undefined
  ])

  testTypeGuard('isTypeDefinition', isTypeDefinition, [{
    name: 'test',
    fields: []
  }, {
    name: 'test',
    fields: [{
      name: 'field1',
      type: 'string'
    }]
  }, {
    name: 'test',
    fields: [{
      name: 'field1',
      type: 'string'
    }],
    labelKey: 'test.label'
  }, {
    name: 'test',
    fields: [{
      name: 'field1',
      type: 'string'
    }],
    defaultIcon: 'abc'
  }], [{
    name: '_test'
  }, {
    name: 'test'
  }, {
    name: 'test',
    fields: [{}]
  }, {
    name: 'test',
    fields: [{}]
  }, {
    name: 'test',
    fields: [{}]
  }, {
    name: 'test',
    fields: [{
      name: 'field1',
      type: 'string'
    }],
    labelKey: 0
  }, {
    name: 'test',
    fields: [{
      name: 'field1',
      type: 'string'
    }],
    defaultIcon: null
  }, {}, 1, 0, null, undefined
  ])

  describe('serialization', () => {
    const storage = new MemoryStorage()

    const types: TypeDefinition[] = [{
      name: 'simpleType',
      fields: [{
        name: 'a',
        type: 'string',
        labelKey: 'a'
      }, {
        name: 'b',
        type: 'string',
        placeholderKey: 'b.placeholder'
      }]
    }, {
      name: 'noFieldsButIconType',
      fields: [],
      defaultIcon: 'abc'
    }, {
      name: 'complexType',
      fields: [{
        name: 'string',
        type: 'string',
        labelKey: 'string.label'
      }, {
        name: 'number',
        type: 'number',
        labelKey: 'number.label',
        placeholderKey: 'number.placeholder'
      }, {
        name: 'date',
        type: 'date',
        labelKey: 'date.label',
        regexp: 'date.regexp',
        placeholderKey: 'date.placeholder'
      }],
      labelKey: 'abc',
      defaultIcon: 'def'
    }]

    beforeAll(async () => {
      for await (const type of types) {
        await saveTypeDefinition(storage, type)
      }
    })

    types.forEach(type => {
      const { name } = type
      it(`saves and loads type definition (${name})`, async () => {
        const savedType = await loadTypeDefinition(storage, name)
        expect(savedType).toEqual(type)
      })
    })

    it('returns null if the type does not exist', async () => {
      const unknownType = await loadTypeDefinition(storage, 'unknwon')
      expect(unknownType).toBeNull()
    })
  })
})
