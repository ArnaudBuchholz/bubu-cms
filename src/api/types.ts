import { IStorage, SearchResult } from '../types/IStorage'
import { StoredRecord, STOREDRECORDTYPE_TYPE, STOREDRECORDTYPE_TYPEFIELD } from '../types/StoredRecord'
import { TypeDefinition, deserializeTypeDefinition } from '../types/TypeDefinition'

export async function getAllTypes (storage: IStorage): Promise<TypeDefinition[]> {
  const types: TypeDefinition[] = []
  let skip = 0
  while (true) {
    const result: SearchResult = await storage.search({
      paging: { skip, top: 10 },
      refs: {
        [STOREDRECORDTYPE_TYPE]: [STOREDRECORDTYPE_TYPE]
      }
    })
    if (result.records.length === 0) {
      break
    }
    skip += result.count
    result.records.forEach((typeRecord: StoredRecord) => {
      const fieldRecords: StoredRecord[] = typeRecord.refs[STOREDRECORDTYPE_TYPEFIELD].map(id => result.refs[STOREDRECORDTYPE_TYPEFIELD][id])
      types.push(deserializeTypeDefinition(typeRecord, fieldRecords))
    })
  }
  return types
}
