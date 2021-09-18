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
  findTypeDefinition,
  saveTypeDefinition,
  validateRecord
} from '../../src/types/TypeDefinition'
import { MemoryStorage } from '../../src/storages/memory'
import testTypeGuard from './testTypeGuard.helper'
import { StoredRecordType, StoredRecord, $type, $typefield } from '../../src/types/StoredRecord'

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

  describe('with storage', () => {
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

    const typesId: StoredRecordType[] = []

    beforeAll(async () => {
      for await (const type of types) {
        const typeId = await saveTypeDefinition(storage, type)
        expect(typeId).not.toBeUndefined()
        typesId.push(typeId)
      }
    })

    types.forEach((type, index) => {
      const { name } = type

      it(`saves and finds type definition (${name})`, async () => {
        const savedType = await findTypeDefinition(storage, name)
        expect(savedType).toEqual(type)
      })

      it(`saves and loads type definition (${name})`, async () => {
        const typeId = typesId[index]
        const savedType = await loadTypeDefinition(storage, typeId)
        expect(savedType).toEqual(type)
      })
    })

    it('returns null if the type does not exist (find)', async () => {
      const unknownType = await findTypeDefinition(storage, 'unknwon')
      expect(unknownType).toBeNull()
    })

    it('returns null if the type does not exist (load)', async () => {
      const unknownType = await loadTypeDefinition(storage, 'unknwon')
      expect(unknownType).toBeNull()
    })

    it('returns null if the record gets corrupted', async () => {
      const typeId = typesId[0]
      const typeRecord: StoredRecord | null = await storage.get($type, typeId)
      expect(typeRecord).not.toBeNull()
      if (typeRecord !== null) {
        await storage.delete($typefield, typeRecord.refs[$typefield][0])
        const savedType: TypeDefinition | null = await loadTypeDefinition(storage, typeId)
        expect(savedType).toBeNull()
      }
    })

    it('validates record type (not existing)', async () => {
      const valid: boolean = await validateRecord(storage, {
        type: 'unknown',
        name: 'abc',
        fields: {},
        refs: {}
      })
      expect(valid).toEqual(false)
    })

    it('validates record type (type existing, no further validation for now)', async () => {
      const valid: boolean = await validateRecord(storage, {
        type: typesId[1],
        name: 'abc',
        fields: {},
        refs: {}
      })
      expect(valid).toEqual(true)
    })
  })
})
