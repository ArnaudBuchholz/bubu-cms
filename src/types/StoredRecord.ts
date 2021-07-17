export type FieldValue = undefined | string | number | Date
export type Fields = Record<string, FieldValue>
export type StoredRecordType = string
export type StoredRecordId = string
export type StoredRecordRating = 1 | 2 | 3 | 4 | 5
export type StoredRecordRefs = Record<StoredRecordType, StoredRecordId[]>

export const $type: StoredRecordType = '$type'
export const $tag: StoredRecordType = '$tag'

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
