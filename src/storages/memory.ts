import { nanoid } from 'nanoid'
import { MAX_STOREDRECORDID_LENGTH, StoredRecordId, StoredRecordType, StorableRecord, StoredRecord, StoredRecordRefs } from '../types/StoredRecord'
import { IStorage, SearchOptions, SearchResult, UpdateInstructions, SortableField, UpdateFieldValue } from '../types/IStorage'

type TypeStore = Record<StoredRecordId, StoredRecord>
type Store = Record<StoredRecordType, TypeStore>
type Refs = Record<StoredRecordType, Record<StoredRecordId, StoredRecord[]>>

function rating (record: StoredRecord): number {
  return record.rating ?? 0
}

function touched (record: StoredRecord): number {
  if (record.touched !== undefined) {
    return record.touched.getTime()
  }
  return 0
}

type StoredRecordSorter = (record1: StoredRecord, record2: StoredRecord) => number
const sorters: Record<SortableField, StoredRecordSorter> = {
  name: (record1: StoredRecord, record2: StoredRecord) => record1.name.localeCompare(record2.name),
  rating: (record1: StoredRecord, record2: StoredRecord) => rating(record1) - rating(record2),
  touched: (record1: StoredRecord, record2: StoredRecord) => touched(record1) - touched(record2)
}

function forEachRef (refs: StoredRecordRefs, callback: (type: StoredRecordType, id: StoredRecordId) => boolean): boolean {
  return Object.keys(refs).every((type: StoredRecordType) => {
    const typedRefs: StoredRecordId[] = refs[type]
    return typedRefs.every((id: StoredRecordId) => callback(type, id))
  })
}

export class MemoryStorage implements IStorage {
  private store: Store
  private refs: Refs

  private addRef (type: StoredRecordType, id: StoredRecordId, record: StoredRecord): void {
    let typedRefs: undefined | Record<StoredRecordId, StoredRecord[]> = this.refs[type]
    if (typedRefs === undefined) {
      typedRefs = {}
      this.refs[type] = typedRefs
    }
    let idRefs: undefined | StoredRecord[] = typedRefs[id]
    if (idRefs === undefined) {
      idRefs = []
      typedRefs[id] = idRefs
    }
    idRefs.push(record)
  }

  private delRef (type: StoredRecordType, id: StoredRecordId, record: StoredRecord): void {
    const typedRefs: Record<StoredRecordId, StoredRecord[]> = this.refs[type]
    const idRefs: StoredRecord[] = typedRefs[id]
    const index = idRefs.indexOf(record)
    idRefs.splice(index, 1)
  }

  // region IStorage

  async search (options: SearchOptions): Promise<SearchResult> {
    let records: StoredRecord[] = []
    let initial: boolean = true
    forEachRef(options.refs, (type: StoredRecordType, id: StoredRecordId) => {
      const refRecords: StoredRecord[] = this.refs[type][id]
      if (initial) {
        records = refRecords
        initial = false
      } else {
        records = records.filter(record => refRecords.includes(record))
      }
      return records.length !== 0
    })
    if (initial) {
      records = Object.keys(this.store).reduce((all: StoredRecord[], type: StoredRecordType) => {
        const typeStore: TypeStore = this.store[type]
        const typeRecords: StoredRecord[] = Object.keys(typeStore).map(id => typeStore[id])
        return [...all, ...typeRecords]
      }, [])
    }

    if (options.search !== undefined) {
      const lowerCaseSearch = options.search.toLowerCase()
      records = records.filter(record => record.name.toLowerCase().includes(lowerCaseSearch))
    }

    if (options.sort !== undefined) {
      const baseSorter: StoredRecordSorter = sorters[options.sort.field]
      let sorter: StoredRecordSorter
      if (!options.sort.ascending) {
        sorter = (record1, record2) => -baseSorter(record1, record2)
      } else {
        sorter = baseSorter
      }
      records.sort(sorter)
    }

    const result: SearchResult = {
      count: records.length,
      records: records.slice(options.paging.skip, options.paging.skip + options.paging.top),
      refs: {}
    }

    result.records.forEach(record => {
      forEachRef(record.refs, (type: StoredRecordType, id: StoredRecordId) => {
        if (result.refs[type]?.[id] === undefined) {
          result.refs[type] ??= {}
          result.refs[type][id] = this.store[type][id]
        }
        return true
      })
    })

    return result
  }

  async get (type: StoredRecordType, id: StoredRecordId): Promise<null | StoredRecord> {
    return this.store[type]?.[id] ?? null
  }

  async create (record: StorableRecord): Promise<StoredRecordId> {
    const { type } = record
    const id: StoredRecordId = nanoid(MAX_STOREDRECORDID_LENGTH)
    if (this.store[type] === undefined) {
      this.store[type] = {}
    }
    const stored: StoredRecord = { ...record, id }
    this.store[type][id] = stored
    forEachRef(record.refs, (refType: StoredRecordType, refId: StoredRecordId) => {
      this.addRef(refType, refId, stored)
      return true
    })
    return id
  }

  async update (type: StoredRecordType, id: StoredRecordId, instructions: UpdateInstructions): Promise<void> {
    const record: StoredRecord = this.store[type][id]
    if (instructions.name !== undefined) {
      record.name = instructions.name
    }
    if (instructions.icon === null) {
      delete record.icon
    } else if (instructions.icon !== undefined) {
      record.icon = instructions.icon
    }
    if (instructions.rating === null) {
      delete record.rating
    } else if (instructions.rating !== undefined) {
      record.rating = instructions.rating
    }
    if (instructions.touched === null) {
      delete record.touched
    } else if (instructions.touched !== undefined) {
      record.touched = instructions.touched
    }
    forEachRef(instructions.refs.add, (type: StoredRecordType, id: StoredRecordId) => {
      this.addRef(type, id, record)
      record.refs[type].push(id)
      return true
    })
    forEachRef(instructions.refs.del, (type: StoredRecordType, id: StoredRecordId) => {
      this.delRef(type, id, record)
      const typedRefs = record.refs[type]
      typedRefs.splice(typedRefs.indexOf(id), 1)
      return true
    })
    Object.keys(instructions.fields).forEach(field => {
      const value: UpdateFieldValue = instructions.fields[field]
      if (value === null) {
        delete record.fields[field] // eslint-disable-line @typescript-eslint/no-dynamic-delete
      } else {
        record.fields[field] = value
      }
    })
  }

  async delete (type: StoredRecordType, id: StoredRecordId): Promise<void> {
    const record: StoredRecord = this.store[type][id]
    forEachRef(record.refs, (type: StoredRecordType, id: StoredRecordId) => {
      this.delRef(type, id, record)
      return true
    })
    delete this.store[type][id] // eslint-disable-line @typescript-eslint/no-dynamic-delete
  }

  // endregion

  constructor () {
    this.store = {}
    this.refs = {}
  }
}
