export type FieldValue = undefined | string | number | Date
export function isFieldValue (value: any): value is FieldValue {
  const typeofValue: string = typeof value
  if (['undefined', 'string'].includes(typeofValue)) {
    return true
  }
  if (typeofValue === 'number') {
    return Math.round(value) === value // Integer
  }
  return value instanceof Date
}

export type Fields = Record<string, FieldValue>
export function isFields (value: any): value is Fields {
  if (typeof value !== 'object') {
    return false
  }
  return Object.keys(value).every((name: string) => isFieldValue(value[name]))
}

export type StoredRecordType = string
export const $type: StoredRecordType = '$type'
export const $tag: StoredRecordType = '$tag'
export function isStoredRecordType (value: any): value is StoredRecordType {
  if (typeof value !== 'string') {
    return false
  }
  return [$type, $tag].includes(value) || value.match(/[a-zA-Z]+/) !== null
}

export type StoredRecordId = string
export function IsStoredRecordId (value: any): value is StoredRecordId {
  return typeof value === 'string'
}

export type StoredRecordRating = 1 | 2 | 3 | 4 | 5
export function IsStoredRecordRating (value: any): value is StoredRecordRating {
  return typeof value === 'number' && [1, 2, 3, 4, 5].includes(value)
}

export type StoredRecordRefs = Record<StoredRecordType, StoredRecordId[]>
export function isStoredRecordRefs (value: any): value is StoredRecordRefs {
  if (typeof value !== 'object') {
    return false
  }
  return Object.keys(value).every((type: string) => {
    if (!isStoredRecordType(type)) {
      return false
    }
    const ids: any = value[type]
    if (!Array.isArray(ids)) {
      return false
    }
    return ids.every((id: any) => IsStoredRecordId)
  })
}

export interface StoredRecord {
  type: StoredRecordType
  id: StoredRecordId
  name: string
  icon?: string
  rating?: StoredRecordRating
  touched?: Date
  fields: Fields
  refs: StoredRecordRefs
}

export function isStoredRecord (jsonObject: any): jsonObject is StoredRecord {
  if (typeof jsonObject !== 'object') {
    return false
  }
  const { type, id, name, fields, refs } = jsonObject
  if (type === undefined || id === undefined || name === undefined || fields === undefined || refs === undefined) {
    return false
  }
  if (!isStoredRecordType(type) || !IsStoredRecordId(id)) {
    return false
  }
  if (name.length === 0) {
    return false
  }
  return true
}
