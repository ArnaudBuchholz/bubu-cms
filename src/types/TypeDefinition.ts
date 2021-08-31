import { IStorage } from '../types/IStorage'
import { StoredRecord, $type, $typefield, $typeattr, FieldValue } from '../types/StoredRecord'

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

export async function loadTypeDefinition (storage: IStorage, name: string): Promise<TypeDefinition | null> {
  const record: StoredRecord | null = await storage.get($type, name)
  if (record === null) {
    return null
  }
  const typeDefinition: TypeDefinition = {
    name,
    fields: []
  }
  map(['labelKey'], record.fields, typeDefinition)
  if (record.refs[$typefield] !== undefined) {
    const fieldRecords: StoredRecord[] = (await Promise.all(record.refs[$typefield].map(async id => await storage.get($typefield, id))))
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

export async function saveTypeDefinition (storage: IStorage, typeDefinition: TypeDefinition): Promise<void> {
  const record: StoredRecord = {
    type: $type,
    id: typeDefinition.name,
    fields: {},
    refs: {
      [$typefield]: []
    }
  }
  map(['labelKey'], typeDefinition, record.fields)
  const fields: StoredRecord[] = typeDefinition.fields.map(fieldDefinition => {
    const record: StoredRecord = {
      type: $typefield,
      id: '',
      fields: {},
      refs: {}
    }
    map(['labelKey', 'regexp', 'placeholderKey'], fieldDefinition, record.fields)
    return record
  })
  return await Promise.all([
    storage.create(record),
    ...fields.map(filed => storage.create(field))
  ])
}
