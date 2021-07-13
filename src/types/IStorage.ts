import {
  StoredRecordType,
  StoredRecordId,
  StoredRecordRating,
  StoredRecordRefs,
  Fields,
  StoredRecord
} from './StoredRecord'

export type SortableField = 'name' | 'rating' | 'touched'

export interface SearchOptions {
  paging: {
    skip: number
    top: number
  }
  sort?: {
    field: SortableField
    ascending: boolean
  }
  refs: StoredRecordRefs
  search?: string
}

export interface SearchResult {
  count: number
  records: StoredRecord[]
  refs: Record<StoredRecordType, Record<StoredRecordId, StoredRecord>>
}

export interface UpdateInstructions {
  name?: string
  icon?: string
  rating?: StoredRecordRating
  touched?: Date
  fields: Fields
  refs: {
    add: StoredRecordRefs
    del: StoredRecordRefs
  }
}

export interface IStorage {
  search: (options: SearchOptions) => Promise<SearchResult>
  get: (type: StoredRecordType, id: StoredRecordId) => Promise<undefined | StoredRecord>
  create: (record: StoredRecord) => Promise<void>
  update: (type: StoredRecordType, id: StoredRecordId, instructions: UpdateInstructions) => Promise<void>
  delete: (type: StoredRecordType, id: StoredRecordId) => Promise<void>
}
