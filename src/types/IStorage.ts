import { StoredRecordType, StoredRecordId, StoredRecordRating, StoredRecordRefs, StorableRecord, StoredRecord, FieldValue, FieldName } from './StoredRecord'

export type SortableField = 'name' | 'rating' | 'touched'
export function isSortableField (value: any): value is SortableField {
  return ['name', 'rating', 'touched'].includes(value)
}

export interface SortingOptions {
  field: SortableField
  ascending: boolean
}

export interface SearchOptions {
  paging: {
    skip: number
    top: number
  }
  sort?: SortingOptions
  refs: StoredRecordRefs
  search?: string
}

export interface SearchResult {
  count: number
  records: StoredRecord[]
  refs: Record<StoredRecordType, Record<StoredRecordId, StoredRecord>>
}

export type UpdateFieldValue = null | FieldValue
export type UpdateFields = Record<FieldName, UpdateFieldValue>
export interface UpdateInstructions {
  name?: string
  icon?: null | string
  rating?: null | StoredRecordRating
  touched?: null | Date
  fields: UpdateFields
  refs: {
    add: StoredRecordRefs
    del: StoredRecordRefs
  }
}

export interface IStorage {
  search: (options: SearchOptions) => Promise<SearchResult>
  get: (type: StoredRecordType, id: StoredRecordId) => Promise<null | StoredRecord>
  create: (record: StorableRecord) => Promise<StoredRecordId>
  update: (type: StoredRecordType, id: StoredRecordId, instructions: UpdateInstructions) => Promise<void>
  delete: (type: StoredRecordType, id: StoredRecordId) => Promise<void>
}
