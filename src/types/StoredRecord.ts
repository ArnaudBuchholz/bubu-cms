import { isA, notA, checkLiteralObject, checkDate } from './helpers'

export type FieldValue = string | number | Date
export const MAX_FIELDVALUE_LENGTH = 256
export function checkFieldValue (value: any): asserts value is FieldValue {
  const typeofValue: string = typeof value
  if (typeofValue === 'string') {
    if (value.length > MAX_FIELDVALUE_LENGTH) {
      notA('FieldValue', new Error('string too long'))
    }
    return
  }
  if ((typeofValue === 'number' && Math.round(value) !== value) || !(value instanceof Date)) {
    notA('FieldValue', new Error('string, integer or date only'))
  }
}
export const isFieldValue = isA(checkFieldValue)

export type FieldName = string
export const MAX_FIELDNAME_LENGTH: number = 64
export const NAME_REGEX = '[a-zA-Z][a-zA-Z0-9_]*'
const nameRegex = new RegExp(`^${NAME_REGEX}$`)
export function checkValidName (value: any, maxLength: number): void {
  if (typeof value !== 'string' || value.match(nameRegex) === null || value.length > maxLength) {
    throw new Error('Invalid name or name too long')
  }
}
export function checkFieldName (value: any): asserts value is FieldName {
  try {
    checkValidName(value, MAX_FIELDNAME_LENGTH)
  } catch (e) {
    if (e instanceof Error) {
      notA('FieldName', e)
    }
    throw e
  }
}
export const isFieldName = isA(checkFieldName)

export type Fields = Record<FieldName, FieldValue>
export function checkFields (value: any): asserts value is Fields {
  try {
    checkLiteralObject(value)
    Object.keys(value).forEach((name: string) => {
      checkFieldName(name)
      checkFieldValue(value[name])
    })
  } catch (e) {
    notA('Fields')
  }
}
export const isFields = isA(checkFields)

export type StoredRecordId = string
export const MAX_STOREDRECORDID_LENGTH: number = 16
export const STOREDRECORDID_REGEX = '[a-zA-Z0-9_-]+'
export function isValidNonEmptyString (value: any, maxLength: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength
}
const storedRecordRegex = new RegExp(`^${STOREDRECORDID_REGEX}$`)
export function checkStoredRecordId (value: any): asserts value is StoredRecordId {
  if (!isValidNonEmptyString(value, MAX_STOREDRECORDID_LENGTH) ||
    value.match(storedRecordRegex) === null) {
    notA('StoredRecordID')
  }
}
export const isStoredRecordId = isA(checkStoredRecordId)

export type StoredRecordType = StoredRecordId
export const MAX_STOREDRECORDTYPE_LENGTH: number = MAX_STOREDRECORDID_LENGTH
export const STOREDRECORDTYPE_TAG: StoredRecordType = '$tag'
export const STOREDRECORDTYPE_TYPE: StoredRecordType = '$type'
export const STOREDRECORDTYPE_TYPEFIELD: StoredRecordType = '$typefield'
export function checkStoredRecordType (value: any): asserts value is StoredRecordType {
  if (![STOREDRECORDTYPE_TAG, STOREDRECORDTYPE_TYPE, STOREDRECORDTYPE_TYPEFIELD].includes(value) && !isStoredRecordId(value)) {
    notA('StoredRecordType')
  }
}
export const isStoredRecordType = isA(checkStoredRecordType)

export const MAX_STOREDRECORDNAME_LENGTH: number = 256
export type StoredRecordName = string
function checkStoredRecordName (value: any): asserts value is StoredRecordName {
  if (!isValidNonEmptyString(value, MAX_STOREDRECORDNAME_LENGTH)) {
    notA('StoredRecordName')
  }
}
const isStoredRecordName = isA(checkStoredRecordName)

export const MAX_STOREDRECORDICON_LENGTH: number = 256
export type StoredRecordIcon = string
function checkStoredRecordIcon (value: any): asserts value is StoredRecordIcon {
  if (!isValidNonEmptyString(value, MAX_STOREDRECORDICON_LENGTH)) {
    notA('StoredRecordIcon')
  }
}
const isStoredRecordIcon = isA(checkStoredRecordIcon)

export type StoredRecordRating = 1 | 2 | 3 | 4 | 5
export function checkStoredRecordRating (value: any): asserts value is StoredRecordRating {
  if (![1, 2, 3, 4, 5].includes(value)) {
    notA('StoredRecordRating')
  }
}
export const isStoredRecordRating = isA(checkStoredRecordRating)

export type StoredRecordRefs = Record<StoredRecordType, StoredRecordId[]>
export function checkStoredRecordRefs (value: any): asserts value is StoredRecordRefs {
  try {
    checkLiteralObject(value)
    Object.keys(value).forEach((type: string) => {
      checkStoredRecordType(type)
      const ids: any = value[type]
      if (!Array.isArray(ids)) {
        throw new Error()
      }
      ids.forEach((id: any) => checkStoredRecordId)
    })
  } catch (e) {
    notA('StoredRecordRefs')
  }
}
export const isStoredRecordRefs = isA(checkStoredRecordRefs)

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

export function checkStorableRecord (value: any): asserts value is StorableRecord {
  try {
    checkLiteralObject(value)
    const { type, name, icon, rating, touched, fields, refs } = value
    checkStoredRecordType(type)
    checkStoredRecordName(name)
    if (icon !== undefined) {
      checkStoredRecordIcon(icon)
    }
    if (rating !== undefined) {
      checkStoredRecordRating(rating)
    }
    if (touched === undefined) {
      checkDate(touched)
    }
    checkFields(fields)
    checkStoredRecordRefs(refs)
  } catch (e) {
    notA('StorableRecord')
  }
}
export const isStorableRecord = isA(checkStorableRecord)

export function checkStoredRecord (value: any): asserts value is StoredRecord {
  try {
    checkStorableRecord(value)
    checkStoredRecordId((value as any).id)
  } catch (e) {
    notA('StoredRecord')
  }
}
export const isStoredRecord = isA(checkStoredRecord)