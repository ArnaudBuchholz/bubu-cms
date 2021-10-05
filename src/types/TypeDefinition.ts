import { SearchResult, IStorage } from '../types/IStorage'
import {
  isLiteralObject,
  isValidNonEmptyString,
  isValidName,
  isFieldName,
  StoredRecordType,
  StoredRecordId,
  StorableRecord,
  StoredRecord,
  $type,
  $typefield
} from '../types/StoredRecord'

export type FieldType = 'string' | 'number' | 'date'

export function isFieldType (value: any): value is FieldType {
  return ['string', 'number', 'date'].includes(value)
}

export interface FieldDefinition {
  name: string
  type: FieldType
  labelKey?: string
  regexp?: string
  placeholderKey?: string
}

export const MAX_TRANSLATIONKEY_LENGTH: number = 64
export const MAX_REGEXP_LENGTH: number = 128

export function isFieldDefinition (value: any): value is FieldDefinition {
  if (!isLiteralObject(value)) {
    return false
  }
  const { name, type, labelKey, regexp, placeholderKey } = value
  return isFieldName(name) &&
    isFieldType(type) &&
    (labelKey === undefined || isValidNonEmptyString(labelKey, MAX_TRANSLATIONKEY_LENGTH)) &&
    (regexp === undefined || isValidNonEmptyString(regexp, MAX_REGEXP_LENGTH)) &&
    (placeholderKey === undefined || isValidNonEmptyString(placeholderKey, MAX_TRANSLATIONKEY_LENGTH))
}

export type TypeName = string
export const MAX_TYPENAME_LENGTH = 64
export function isTypeName (value: any): value is TypeName {
  return isValidName(value, MAX_TYPENAME_LENGTH)
}

export type DefaultIcon = string
export const MAX_DEFAULTICON_LENGTH = 64
export function isDefaultIcon (value: any): value is DefaultIcon {
  return isValidNonEmptyString(value, MAX_DEFAULTICON_LENGTH)
}

export interface TypeDefinition {
  name: TypeName
  labelKey?: string
  defaultIcon?: string
  fields: FieldDefinition[]
/*
  number?: string
  numberUnit?: string
  status1?: string
  status2?: string
*/
}

export interface StoredTypeDefinition extends TypeDefinition {
  id: StoredRecordType
}

export function isTypeDefinition (value: any): value is TypeDefinition {
  if (!isLiteralObject(value)) {
    return false
  }
  const { name, labelKey, defaultIcon, fields } = value
  return isTypeName(name) &&
    (labelKey === undefined || isValidNonEmptyString(labelKey, MAX_TRANSLATIONKEY_LENGTH)) &&
    (defaultIcon === undefined || isDefaultIcon(defaultIcon)) &&
    (Array.isArray(fields) && fields.every(isFieldDefinition))
}

function map (fields: string[], source: Record<string, any>, destination: any): void {
  fields.forEach(field => {
    const value = source[field]
    if (value !== undefined) {
      destination[field] = value
    }
  })
}

const mappableTypeDefinitionFields = ['labelKey', 'defaultIcon']
const mappableFieldDefinitionFields = ['labelKey', 'regexp', 'placeholderKey']

export function deserializeTypeDefinition (typeRecord: StoredRecord, fieldRecords: StoredRecord[]): StoredTypeDefinition {
  const typeDefinition: StoredTypeDefinition = {
    id: typeRecord.id,
    name: typeRecord.name,
    fields: []
  }
  map(mappableTypeDefinitionFields, typeRecord.fields, typeDefinition)
  fieldRecords.forEach(fieldRecord => {
    const fieldDefinition: FieldDefinition = {
      name: fieldRecord.name,
      type: fieldRecord.fields.type as FieldType
    }
    map(mappableFieldDefinitionFields, fieldRecord.fields, fieldDefinition)
    typeDefinition.fields.push(fieldDefinition)
  })
  return typeDefinition
}

export async function loadTypeDefinition (storage: IStorage, type: StoredRecordType): Promise<StoredTypeDefinition | null> {
  const typeRecord: StoredRecord | null = await storage.get($type, type)
  if (typeRecord === null) {
    return null
  }
  const fieldRecords: StoredRecord[] = []
  for await (const fieldId of typeRecord.refs[$typefield]) {
    const fieldRecord: StoredRecord | null = await storage.get($typefield, fieldId)
    if (fieldRecord === null) {
      return null
    }
    fieldRecords.push(fieldRecord)
  }
  return deserializeTypeDefinition(typeRecord, fieldRecords)
}

export async function findTypeDefinition (storage: IStorage, name: string): Promise<StoredTypeDefinition | null> {
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
  const typeRecord: StoredRecord = result.records[0]
  const fieldRecords: StoredRecord[] = typeRecord.refs[$typefield].map(id => result.refs[$typefield][id])
  return deserializeTypeDefinition(typeRecord, fieldRecords)
}

export async function saveTypeDefinition (storage: IStorage, typeDefinition: TypeDefinition): Promise<StoredRecordType> {
  const type: StorableRecord = {
    type: $type,
    name: typeDefinition.name,
    fields: {},
    refs: {}
  }
  map(mappableTypeDefinitionFields, typeDefinition, type.fields)
  const fields: StorableRecord[] = typeDefinition.fields.map(fieldDefinition => {
    const record: StorableRecord = {
      type: $typefield,
      name: fieldDefinition.name,
      fields: {
        type: fieldDefinition.type
      },
      refs: {}
    }
    map(mappableFieldDefinitionFields, fieldDefinition, record.fields)
    return record
  })
  const fieldIds: StoredRecordId[] = await Promise.all(fields.map(async field => await storage.create(field)))
  type.refs[$typefield] = fieldIds
  return await storage.create(type)
}

export async function validateRecord (storage: IStorage, record: StorableRecord): Promise<boolean> {
  const typeDef: TypeDefinition | null = await loadTypeDefinition(storage, record.type)
  if (typeDef === null) {
    return false
  }
  // At least type exists
  return true
}
