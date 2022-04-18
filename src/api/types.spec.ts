import { MemoryStorage } from '../storages/memory'
import { TypeDefinition, saveTypeDefinition } from '../types/TypeDefinition'
import { getAllTypes } from './types'

describe('api/types', () => {
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

  it('retreives all stored types', async () => {
    const allTypes = await getAllTypes(storage)
    expect(allTypes.length).toEqual(types.length)
    expect(allTypes.every((receivedType: TypeDefinition) => {
      // Since deserialization of types is already tested only assess types exists
      return types.some((type: TypeDefinition) => type.name === receivedType.name)
    })).toBe(true)
  })
})
