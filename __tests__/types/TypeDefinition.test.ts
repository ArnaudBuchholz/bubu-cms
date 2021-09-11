import { TypeDefinition, loadTypeDefinition, saveTypeDefinition } from '../../src/types/TypeDefinition'
import { MemoryStorage } from '../../src/storages/memory'

describe('types/TypeDefinition', () => {
  const storage = new MemoryStorage()

  const type1: TypeDefinition = {
    name: 'type1',
    fields: [{
      name: 'a',
      type: 'string',
      labelKey: 'a'
    }, {
      name: 'b',
      type: 'string',
      placeholderKey: 'b.placeholder'
    }]
  }

  beforeAll(async () => {
    await saveTypeDefinition(storage, type1)
  })

  it('saves and loads type definition', async () => {
    const savedType1 = await loadTypeDefinition(storage, 'type1')
    expect(savedType1).toEqual(type1)
  })

  it('returns null if the type does not exist', async () => {
    const unknownType = await loadTypeDefinition(storage, 'unknwon')
    expect(unknownType).toBeNull()
  })
})
