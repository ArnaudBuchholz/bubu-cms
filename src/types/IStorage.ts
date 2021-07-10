import {
  StoredRecordType,
  StoredRecordId,
  StoredRecordRating,
  StoredRecordRefs,
  Fields,
  StoredRecord
} from './StoredRecord'

export type SearchOptions = {
  paging: {
    skip: number,
    top: number
  },
  sort?: {
    field: string,
    ascending: boolean
  }
  refs: StoredRecordRefs,
  search?: string
}

export type SearchResult = {
  count: number,
  records: StoredRecord[],
  refs: Record<StoredRecordType, Record<StoredRecordId, StoredRecord>>
}

export type UpdateInstructions = {
  name?: string,
  icon?: string,
  rating?: StoredRecordRating,
  touched?: Date,
  tags: {
    add: string[],
    del: []
  },
  fields: {
    add: Fields,
    del: Fields
  }
}

export interface IStorage {
  search (options: SearchOptions): Promise<SearchResult>
  get (type: StoredRecordType, id: StoredRecordId): Promise<undefined | StoredRecord>
  create (record: StoredRecord): Promise<void>
  update (type: StoredRecordType, id: StoredRecordId, instructions: UpdateInstructions): Promise<void>
  delete (type: StoredRecordType, id: StoredRecordId): Promise<void>
}
