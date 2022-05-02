import { isA, checkA, notA, checkLiteralObject, checkDate, ErrorWithReason } from './helpers'

export type FieldValue = string | number | Date
export const MAX_FIELDVALUE_LENGTH = 256
export function checkFieldValue (value: any): asserts value is FieldValue {
  checkA('FieldValue', () => {
    const typeofValue: string = typeof value
    if (typeofValue === 'string') {
      if (value.length > MAX_FIELDVALUE_LENGTH) {
        throw new Error('string too long')
      }
    } else if (typeofValue === 'number') {
      if (Math.round(value) !== value) {
        throw new Error('string, integer or date only')
      }
    } else if (!(value instanceof Date)) {
      throw new Error('string, integer or date only')
    }
  })
}
export const isFieldValue: (value: any) => value is FieldValue = isA(checkFieldValue)

export function checkValidString (value: any, maxLength: number, regexp = /.*/): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Not a string')
  }
  if (value.length === 0) {
    throw new Error('Empty string')
  }
  if (value.length > maxLength) {
    throw new Error('String too long')
  }
  if (value.match(regexp) === null) {
    throw new Error('Invalid syntax')
  }
}

export type FieldName = string
export const MAX_FIELDNAME_LENGTH: number = 64
export const NAME_REGEX = '[a-zA-Z][a-zA-Z0-9_]*'
const nameRegex = new RegExp(`^${NAME_REGEX}$`)
export function checkFieldName (value: any): asserts value is FieldName {
  checkA('FieldName', () => checkValidString(value, MAX_FIELDNAME_LENGTH, nameRegex))
}
export const isFieldName = isA(checkFieldName)

export type Fields = Record<FieldName, FieldValue>
export function checkFields (value: any): asserts value is Fields {
  checkA('Fields', () => {
    checkLiteralObject(value)
    Object.keys(value).forEach((name: string) => {
      checkFieldName(name)
      checkFieldValue(value[name])
    })
  })
}
export const isFields = isA(checkFields)

export type StoredRecordId = string
export const MAX_STOREDRECORDID_LENGTH: number = 16
export const STOREDRECORDID_REGEX = '[a-zA-Z0-9_-]+'
const storedRecordRegex = new RegExp(`^${STOREDRECORDID_REGEX}$`)
export function checkStoredRecordId (value: any): asserts value is StoredRecordId {
  checkA('StoredRecordId', () => checkValidString(value, MAX_STOREDRECORDID_LENGTH, storedRecordRegex))
}
export const isStoredRecordId = isA(checkStoredRecordId)

export type StoredRecordType = StoredRecordId
export const MAX_STOREDRECORDTYPE_LENGTH: number = MAX_STOREDRECORDID_LENGTH
export const STOREDRECORDTYPE_TAG: StoredRecordType = '$tag'
export const STOREDRECORDTYPE_TYPE: StoredRecordType = '$type'
export const STOREDRECORDTYPE_TYPEFIELD: StoredRecordType = '$typefield'
export function checkStoredRecordType (value: any): asserts value is StoredRecordType {
  checkA('StoredRecordType', () => {
    if (![STOREDRECORDTYPE_TAG, STOREDRECORDTYPE_TYPE, STOREDRECORDTYPE_TYPEFIELD].includes(value)) {
      checkStoredRecordId(value)
    }
  })
}
export const isStoredRecordType = isA(checkStoredRecordType)

export const MAX_STOREDRECORDNAME_LENGTH: number = 256
export type StoredRecordName = string
export function checkStoredRecordName (value: any): asserts value is StoredRecordName {
  checkA('StoredRecordName', () => checkValidString(value, MAX_STOREDRECORDNAME_LENGTH))
}
export const isStoredRecordName = isA(checkStoredRecordName)

export const MAX_STOREDRECORDICON_LENGTH: number = 256
export type StoredRecordIcon = string
export function checkStoredRecordIcon (value: any): asserts value is StoredRecordIcon {
  checkA('StoredRecordIcon', () => checkValidString(value, MAX_STOREDRECORDICON_LENGTH))
}
export const isStoredRecordIcon = isA(checkStoredRecordIcon)

export type StoredRecordRating = 1 | 2 | 3 | 4 | 5
export function checkStoredRecordRating (value: any): asserts value is StoredRecordRating {
  if (![1, 2, 3, 4, 5].includes(value)) {
    notA('StoredRecordRating')
  }
}
export const isStoredRecordRating = isA(checkStoredRecordRating)

export type StoredRecordRefs = Record<StoredRecordType, StoredRecordId[]>
export function checkStoredRecordRefs (value: any): asserts value is StoredRecordRefs {
  checkA('StoredRecordRefs', () => {
    checkLiteralObject(value)
    Object.keys(value).forEach((type: string) => {
      try {
        checkStoredRecordType(type)
        const ids: any = value[type]
        if (!Array.isArray(ids)) {
          throw new Error('Not an array')
        }
        if (type === STOREDRECORDTYPE_TYPE) {
          ids.forEach((id: any) => checkStoredRecordType(id))
        } else {
          ids.forEach((id: any) => checkStoredRecordId(id))
        }
      } catch (e) {
        throw new ErrorWithReason(`while processing ${type}`, e as Error)
      }
    })
  })
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
  checkA('StorableRecord', () => {
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
    if (touched !== undefined) {
      checkDate(touched)
    }
    checkFields(fields)
    checkStoredRecordRefs(refs)
  })
}
export const isStorableRecord = isA(checkStorableRecord)

export function checkStoredRecord (value: any): asserts value is StoredRecord {
  checkA('StoredRecord', () => {
    checkStorableRecord(value)
    checkStoredRecordId((value as any).id)
  })
}
export const isStoredRecord = isA(checkStoredRecord)
