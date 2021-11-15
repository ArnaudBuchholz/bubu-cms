import {
  StoredRecordType,
  StoredRecordId,
  StoredRecordRating,
  StoredRecordRefs,
  StorableRecord,
  StoredRecord,
  FieldValue,
  FieldName,
  Fields
} from './StoredRecord'

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
  refs?: StoredRecordRefs
  fields?: Fields
  search?: string
  fullNameOnly?: boolean
}

export function encodeSearchOptions (options: SearchOptions): string {
  const urlParams: Record<string, string> = {
    skip: options.paging.skip.toString(),
    top: options.paging.top.toString()
  }
  if (options.sort !== undefined) {
    let direction
    if (options.sort.ascending) {
      direction = 'asc'
    } else {
      direction = 'desc'
    }
    urlParams.sort = `${options.sort.field} ${direction}`
  }
  if (options.search !== undefined) {
    if (options.fullNameOnly === true) {
      urlParams.name = encodeURIComponent(options.search)
    } else {
      urlParams.search = encodeURIComponent(options.search)
    }
  }
  const refsCount = Object.keys(options.refs ?? {}).length
  if (refsCount > 0) {
    urlParams.refs = JSON.stringify(options.refs)
  }
  return Object.keys(urlParams)
    .map(key => `${key}=${urlParams[key]}`)
    .join('&')
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
