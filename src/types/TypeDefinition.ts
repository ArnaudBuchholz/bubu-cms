import { SearchResult, IStorage } from '../types/IStorage'
import { StoredRecordType, StoredRecordId, StorableRecord, StoredRecord, $type, $typefield } from '../types/StoredRecord'

export type FieldType = 'string' | 'number' | 'date'

export interface FieldDefinition {
  name: string
  type: FieldType
  labelKey?: string
  regexp?: string
  placeholderKey?: string
}

export interface TypeDefinition {
  name: string
  labelKey?: string
  defaultIcon?: string
  fields: FieldDefinition[]
  number?: string
  numberUnit?: string
  status1?: string
  status2?: string
}

export function isTypeDefinition (value: any): value is TypeDefinition {
  return true
}

function map (fields: string[], source: Record<string, any>, destination: any): void {
  fields.forEach(field => {
    const value = source[field]
    if (value !== undefined) {
      destination[field] = value
    }
  })
}

const mappableTypeDefinitionFields = ['labelKey']
const mappableFieldDefinitionFields = ['labelKey', 'regexp', 'placeholderKey']

/*
export async function loadTypeDefinition (storage: IStorage, name: string): Promise<TypeDefinition | null> {
  const result: SearchResult = await storage.search({
    paging: { skip: 0, top: 1 },
    search: name,
    refs: {
      [$type]: [$type]
    }
  })
  if (result.count !== 1) {
    return null
  }
  const type: StoredRecord = result.records[0]
  const typeDefinition: TypeDefinition = {
    name,
    fields: []
  }
  map(mappableTypeDefinitionFields, type.fields, typeDefinition)
  if (type.refs[$typefield] !== undefined) {
    const fieldRecords: StoredRecord[] = type.refs[$typefield].map(id => result.refs[$typefield][id])

    (await Promise.all(record.refs[$typefield].map(async id => await storage.get($typefield, id))))
      .filter((result: StoredRecord | null) => result !== null) as StoredRecord[]
    fieldRecords.forEach(fieldRecord => {
      const fieldDefinition: FieldDefinition = {
        name: fieldRecord?.name,
        type: fieldRecord.fields.type as FieldType
      }
      map(['labelKey', 'regexp', 'placeholderKey'], record.fields, fieldDefinition)
      typeDefinition.fields.push(fieldDefinition)
    })
  }
  return typeDefinition
}
*/

export async function saveTypeDefinition (storage: IStorage, typeDefinition: TypeDefinition): Promise<StoredRecordType> {
  const type: StorableRecord = {
    type: $type,
    name: typeDefinition.name,
    fields: {},
    refs: {
      [$type]: [$type]
    }
  }
  map(mappableTypeDefinitionFields, typeDefinition, type.fields)
  const fields: StorableRecord[] = typeDefinition.fields.map(fieldDefinition => {
    const record: StorableRecord = {
      type: $typefield,
      name: fieldDefinition.name,
      fields: {},
      refs: {}
    }
    map(mappableFieldDefinitionFields, fieldDefinition, record.fields)
    return record
  })
  const fieldIds: StoredRecordId[] = await Promise.all(fields.map(async field => await storage.create(field)))
  type.refs[$typefield] = fieldIds
  return await storage.create(type)
}
