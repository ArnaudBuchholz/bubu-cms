import { IStorage, SearchResult } from '../types/IStorage'
import { StoredRecord, $type, $typefield } from '../types/StoredRecord'
import { TypeDefinition, deserializeTypeDefinition } from '../types/TypeDefinition'

export async function getAllTypes (storage: IStorage): Promise<TypeDefinition[]> {
  const types: TypeDefinition[] = []
  let skip = 0
  while (true) {
    const result: SearchResult = await storage.search({
      paging: { skip, top: 10 },
      refs: {
        [$type]: [$type]
      }
    })
    if (result.count === 0) {
      break
    }
    skip += result.count
    result.records.forEach((typeRecord: StoredRecord) => {
      const fieldRecords: StoredRecord[] = typeRecord.refs[$typefield].map(id => result.refs[$typefield][id])
      types.push(deserializeTypeDefinition(typeRecord, fieldRecords))
    })
  }
  return types
}
