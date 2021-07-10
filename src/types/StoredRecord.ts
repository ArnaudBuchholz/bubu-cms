export type Fields = Record<string,undefined | string | number | Date>
export type StoredRecordType = string
export type StoredRecordId = string
export type StoredRecordRating = 1 | 2 | 3 | 4 | 5
export type StoredRecordRefs = Record<StoredRecordType, StoredRecordId[]>

export type StoredRecord = {
  type: StoredRecordType,
  id: StoredRecordId,
  name: string,
  icon?: string,
  rating?: StoredRecordRating,
  touched?: Date,
  refs: StoredRecordRefs,
  fields: Fields
}