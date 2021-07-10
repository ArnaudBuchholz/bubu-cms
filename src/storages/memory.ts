import { StoredRecordId, StoredRecordType, StoredRecord } from '../types/StoredRecord'
import { IStorage, SearchOptions, SearchResult, UpdateInstructions } from '../types/IStorage'
import { resourceLimits } from 'worker_threads'

type TypeStore = Record<string, StoredRecord>
type Store = Record<string, TypeStore>
type Refs = Record<StoredRecordType, Record<StoredRecordId, StoredRecord[]>>

type StoredRecordSorter = (record1: StoredRecord, record2: StoredRecord) => number
const sorters: Record<string, StoredRecordSorter> = {
  name: (record1: StoredRecord, record2: StoredRecord) => record1.name.localeCompare(record2.name),
  rating: (record1: StoredRecord, record2: StoredRecord) => (record1.rating ?? 0) - (record2.rating ?? 0),
  touched: (record1: StoredRecord, record2: StoredRecord) => (record1.touched?.getTime() ?? 0) - (record2.touched?.getTime() ?? 0)
}

export class MemoryStorage implements IStorage {
  private store: Store
  private refs: Refs

  private addRef (type: StoredRecordType, id: StoredRecordId, record: StoredRecord) {
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

  private delRef (type: StoredRecordType, id: StoredRecordId, record: StoredRecord) {
    const typedRefs: Record<StoredRecordId, StoredRecord[]> = this.refs[type]
    const idRefs: StoredRecord[] = typedRefs[id]
    const index = idRefs.indexOf(record)
    idRefs.splice(index, 1)
  }

  //region IStorage

  async search (options: SearchOptions): Promise<SearchResult> {
    const firstTag: StoredRecordId = options.tags[0]
    let records: StoredRecord[] = this.links[firstTag]
    options.tags.slice(1).forEach(tag => {
      records = records.filter(record => record.tags.includes(tag))
    })
    if (options.search !== undefined) {
      const lowerCaseSearch = options.search.toLocaleLowerCase()
      records = records.filter(record => record.name.toLocaleLowerCase().includes(lowerCaseSearch))
    }
    if (options.sort !== undefined) {
      const field = options.sort.field
      if (sorters[field] === undefined) {
        throw new Error('Unknown sort field')
      }
      const baseSorter: StoredRecordSorter = sorters[field]
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
      tags: {}
    }
    result.records.forEach(record => {
      record.tags.forEach(tagId => {
        if (!Object.prototype.hasOwnProperty.call(result.tags, tagId)) {
          result.tags[tagId] = 
        }
      })
    })


    return result
  }

  async get (type: StoredRecordType, id: StoredRecordId): Promise<undefined | StoredRecord> {
    return this.store[type]?.[id]
  }

  async create (record: StoredRecord): Promise<void> {
    const{ type, id } = record
    if (this.store[type] === undefined) {
      this.store[type] = {}
    }
    if (this.store[type][id]) {
      throw new Error('Already existing')
    }
    this.store[record.type][record.id] = record
    record.tags.forEach(tag => this.addLink(tag, record))
  }

  async update (type: StoredRecordType, id: StoredRecordId, instructions: UpdateInstructions): Promise<void> {
    const record = this.store[type]?.[id]
    if (!record) {
      throw new Error('Not existing')
    }
    if (instructions.name !== undefined) {
      record.name = instructions.name
    }
    if (instructions.icon !== undefined) {
      record.icon = instructions.icon
    }
    if (instructions.rating !== undefined) {
      record.rating = instructions.rating
    }
    if (instructions.touched !== undefined) {
      record.touched = instructions.touched
    }
    instructions.tags.add.forEach(tag => {
      record.tags.push(tag)
      this.addLink(tag, record)
    })
    instructions.tags.del.forEach(tag => {
      record.tags.splice(record.tags.indexOf(tag), 1)
      this.delLink(tag, record)
    })
    Object.keys(instructions.fields.add).forEach(field => {
      record.fields[field] = instructions.fields.add[field]
    })
    Object.keys(instructions.fields.del).forEach(field => {
      delete record.fields[field]
    })
  }

  async delete (type: StoredRecordType, id: StoredRecordId): Promise<void> {
    const record = this.store[type]?.[id]
    if (!record) {
      throw new Error('Not existing')
    }
    record.tags.forEach(tag => this.delLink(tag, record))
  }

  //endregion

  constructor () {
    this.store = {}
    this.refs = {}
  }
}