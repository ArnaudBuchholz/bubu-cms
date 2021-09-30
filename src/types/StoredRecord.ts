export function isDate (value: any): value is Date {
  return typeof value === 'object' &&
    value !== null &&
    Object.prototype.toString.call(value) === '[object Date]'
}

export type FieldValue = string | number | Date
export const MAX_FIELDVALUE_LENGTH = 256
export function isFieldValue (value: any): value is FieldValue {
  const typeofValue: string = typeof value
  if (typeofValue === 'string') {
    return value.length <= MAX_FIELDVALUE_LENGTH
  }
  if (typeofValue === 'number') {
    return Math.round(value) === value // Integer
  }
  return value instanceof Date
}

export type FieldName = string
export const MAX_FIELDNAME_LENGTH: number = 64
export function isValidName (value: any, maxLength: number): boolean {
  return typeof value === 'string' && value.match(/^[a-z][a-z_0-9_]*$/i) !== null && value.length <= maxLength
}
export function isFieldName (value: any): value is FieldName {
  return isValidName(value, MAX_FIELDNAME_LENGTH)
}

export type Fields = Record<FieldName, FieldValue>
export function isLiteralObject (value: any): value is Record<string, any> {
  return value instanceof Object &&
    Object.prototype.toString.call(value) === '[object Object]' &&
    Object.getPrototypeOf(value) === Object.getPrototypeOf({})
}
export function isFields (value: any): value is Fields {
  return isLiteralObject(value) &&
    Object.keys(value).every((name: string) => isFieldName(name) && isFieldValue(value[name]))
}

export type StoredRecordId = string
export const MAX_STOREDRECORDID_LENGTH: number = 16
export function isValidNonEmptyString (value: any, maxLength: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength
}
export function isStoredRecordId (value: any): value is StoredRecordId {
  return isValidNonEmptyString(value, MAX_STOREDRECORDID_LENGTH) &&
    value.match(/^[A-Z0-9_-]+$/i) !== null &&
    value.trim() === value
}

export type StoredRecordType = StoredRecordId
export const MAX_STOREDRECORDTYPE_LENGTH: number = MAX_STOREDRECORDID_LENGTH
export const $tag: StoredRecordType = '$tag'
export const $type: StoredRecordType = '$type'
export const $typefield: StoredRecordType = '$typefield'
export function isStoredRecordType (value: any): value is StoredRecordType {
  return [$tag, $type, $typefield].includes(value) || isStoredRecordId(value)
}

export const MAX_STOREDRECORDNAME_LENGTH: number = 256
export type StoredRecordName = string
function isStoredRecordName (value: any): value is StoredRecordName {
  return isValidNonEmptyString(value, MAX_STOREDRECORDNAME_LENGTH)
}

export const MAX_STOREDRECORDICON_LENGTH: number = 256
export type StoredRecordIcon = string
function isStoredRecordIcon (value: any): value is StoredRecordIcon {
  return isValidNonEmptyString(value, MAX_STOREDRECORDICON_LENGTH)
}

export type StoredRecordRating = 1 | 2 | 3 | 4 | 5
export function isStoredRecordRating (value: any): value is StoredRecordRating {
  return typeof value === 'number' && [1, 2, 3, 4, 5].includes(value)
}

export type StoredRecordRefs = Record<StoredRecordType, StoredRecordId[]>
export function isStoredRecordRefs (value: any): value is StoredRecordRefs {
  return isLiteralObject(value) &&
    Object.keys(value).every((type: string) => {
      if (!isStoredRecordType(type)) {
        return false
      }
      const ids: any = value[type]
      if (!Array.isArray(ids)) {
        return false
      }
      return ids.every((id: any) => isStoredRecordId)
    })
}

export interface StorableRecord {
  type: StoredRecordType
  name: StoredRecordName
  icon?: StoredRecordIcon
  rating?: StoredRecordRating
  touched?: Date
  fields: Fields
  refs: StoredRecordRefs
}

export interface StoredRecord extends StorableRecord {
  id: StoredRecordId
}

export function isStorableRecord (value: any): value is StorableRecord {
  if (!isLiteralObject(value)) {
    return false
  }
  const { type, name, icon, rating, touched, fields, refs } = value
  return isStoredRecordType(type) && isStoredRecordName(name) &&
    (icon === undefined || isStoredRecordIcon(icon)) &&
    (rating === undefined || isStoredRecordRating(rating)) &&
    (touched === undefined || isDate(touched)) &&
    isFields(fields) &&
    isStoredRecordRefs(refs)
}

export function isStoredRecord (value: any): value is StoredRecord {
  if (!isStorableRecord(value)) {
    return false
  }
  return isStoredRecordId((value as any).id)
}
