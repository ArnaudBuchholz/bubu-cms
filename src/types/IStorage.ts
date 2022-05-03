import {
  checkValidString,
  checkFieldName,
  StoredRecordType,
  StoredRecordId,
  checkStoredRecordIcon,
  checkStoredRecordRating,
  StoredRecordRating,
  checkStoredRecordRefs,
  StoredRecordRefs,
  StorableRecord,
  StoredRecord,
  FieldValue,
  FieldName,
  checkFields,
  Fields
} from './StoredRecord'
import { checkA, checkDate, checkLiteralObject, isA, notA } from './helpers'

export type SortableField = 'name' | 'rating' | 'touched'
export function checkSortableField (value: any): asserts value is SortableField {
  if (!['name', 'rating', 'touched'].includes(value)) {
    notA('SortableField')
  }
}
export const isSortableField: (value: any) => value is SortableField = isA(checkSortableField)

export interface SortingOptions {
  field: SortableField
  ascending: boolean
}
export function checkSortingOptions (value: any): asserts value is SortingOptions {
  checkA('SortingOptions', () => {
    checkLiteralObject(value)
    checkSortableField(value.field)
    if (typeof value.ascending !== 'boolean') {
      throw new Error('Missing ascending property')
    }
  })
}
export const isSortingOptions: (value: any) => value is SortingOptions = isA(checkSortingOptions)

export const MAX_SEARCHSTRING_LENGTH = 255
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
export function checkSearchOptions (value: any): asserts value is SearchOptions {
  checkA('SearchOptions', () => {
    checkLiteralObject(value)
    const { sort, refs, fields, search, fullNameOnly } = value
    if (sort !== undefined) {
      checkSortingOptions(sort)
    }
    if (refs !== undefined) {
      checkStoredRecordRefs(refs)
    }
    if (fields !== undefined) {
      checkFields(fields)
    }
    if (search !== undefined) {
      checkValidString(search, MAX_SEARCHSTRING_LENGTH)
    }
    if (fullNameOnly !== undefined && typeof fullNameOnly !== 'boolean') {
      throw new Error('invalid fullNameOnly')
    }
  })
}
export const isSearchOptions: (value: any) => value is SearchOptions = isA(checkSearchOptions)

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
export function checkUpdateInstructions (value: any): asserts value is UpdateInstructions {
  checkA('UpdateInstructions', () => {
    checkLiteralObject(value)
    const { name, icon, rating, touched, fields, refs } = value
    if (name !== undefined) {
      checkFieldName(name)
    }
    if (icon !== undefined) {
      checkStoredRecordIcon(icon)
    }
    if (rating !== undefined && rating !== null) {
      checkStoredRecordRating(rating)
    }
    if (touched !== undefined && touched !== null) {
      checkDate(touched)
    }
    if (fields !== undefined) {
      checkFields(fields)
    }
    checkLiteralObject(refs)
    checkStoredRecordRefs(refs.add)
    checkStoredRecordRefs(refs.del)
  })
}
export const isUpdateInstructions: (value: any) => value is UpdateInstructions = isA(checkUpdateInstructions)

export interface IStorage {
  search: (options: SearchOptions) => Promise<SearchResult>
  get: (type: StoredRecordType, id: StoredRecordId) => Promise<null | StoredRecord>
  create: (record: StorableRecord) => Promise<StoredRecordId>
  update: (type: StoredRecordType, id: StoredRecordId, instructions: UpdateInstructions) => Promise<void>
  delete: (type: StoredRecordType, id: StoredRecordId) => Promise<void>
}
