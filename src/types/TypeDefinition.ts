import { IStorage } from '../types/IStorage'
import { FieldDefinition, FieldType } from './FieldDefinition'
import { StoredRecord, $type, $typefield, $typeattr } from '../types/StoredRecord'

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

export async function loadTypeDefinition (storage: IStorage, name: string): Promise<TypeDefinition | null> {
  const existing: StoredRecord | null = await storage.get($type, name)
  if (existing === null) {
    return null
  }
  const typeDefinition: TypeDefinition = {
    name,
    fields: []
  }

  if (existing.refs[$typefield] !== undefined) {
    const fieldRecords: StoredRecord[] = (await Promise.all(existing.refs[$typefield].map(async id => await storage.get($typefield, id))))
      .filter((result: StoredRecord | null) => result !== null) as StoredRecord[]
    fieldRecords.forEach(fieldRecord => {
      const fieldDefinition: FieldDefinition = {
        name: fieldRecord?.name,
        type: fieldRecord.fields.type as FieldType
      }
      if (fieldRecord.fields.labelKey !== undefined) {
        fieldDefinition.labelKey = fieldRecord.fields.labelKey as string
      }
      if (fieldRecord.fields.regexp !== undefined) {
        fieldDefinition.regexp = fieldRecord.fields.regexp as string
      }
      if (fieldRecord.fields.placeholderKey !== undefined) {
        fieldDefinition.placeholderKey = fieldRecord.fields.placeholderKey as string
      }
      typeDefinition.fields.push(fieldDefinition)
    })
  }
  return typeDefinition
}