import { Fields, StoredRecordRating, StoredRecordId, StoredRecordType, StoredRecord } from './StoredRecord'

export type SearchOptions = {
  paging: {
    skip: number,
    top: number
  },
  sort?: {
    field: string,
    ascending: boolean
  }
  tags: StoredRecordId[],
  search?: string
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
  search (options: SearchOptions): Promise<StoredRecord[]>
  get (type: StoredRecordType, id: StoredRecordId): Promise<undefined | StoredRecord>
  create (record: StoredRecord): Promise<void>
  update (type: StoredRecordType, id: StoredRecordId, instructions: UpdateInstructions): Promise<void>
  delete (type: StoredRecordType, id: StoredRecordId): Promise<void>
}
