import { StoredRecordId, StoredRecordType, StoredRecord } from '../types/StoredRecord'
import { IStorage, SearchOptions, UpdateInstructions } from '../types/IStorage'

type TypeStore = Record<string, StoredRecord>
type Store = Record<string, TypeStore>
type Links = Record<string, StoredRecord[]>

type StoredRecordSorter = (record1: StoredRecord, record2: StoredRecord) => number
const sorters: Record<string, StoredRecordSorter> = {
  name: (record1: StoredRecord, record2: StoredRecord) => record1.name.localeCompare(record2.name),
  rating: (record1: StoredRecord, record2: StoredRecord) => (record1.rating ?? 0) - (record2.rating ?? 0),
  touched: (record1: StoredRecord, record2: StoredRecord) => (record1.touched?.getTime() ?? 0) - (record2.touched?.getTime() ?? 0)
}

export class MemoryStorage implements IStorage {
  private store: Store
  private links: Links

  private addLink (tag: string, record: StoredRecord) {
    if (!this.links[tag]) {
      this.links[tag] = []
    }
    this.links[tag].push(record)
  }

  private delLink (tag: string, record: StoredRecord) {
    const tagLinks = this.links[tag]
    if (tagLinks) {
      const index = tagLinks.indexOf(record)
      if (index > -1) {
        tagLinks.splice(index, 1)
      }
    }
  }

  //region IStorage

  async search (options: SearchOptions): Promise<StoredRecord[]> {
    const firstTag: StoredRecordId = options.tags[0]
    let result: StoredRecord[] = this.links[firstTag]
    options.tags.slice(1).forEach(tag => {
      result = result.filter(record => record.tags.includes(tag))
    })
    if (options.search !== undefined) {
      const lowerCaseSearch = options.search.toLocaleLowerCase()
      result = result.filter(record => record.name.toLocaleLowerCase().includes(lowerCaseSearch))
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
      result.sort(sorter)
    }
    return result.slice(options.paging.skip, options.paging.skip + options.paging.top)
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
    this.links = {}
  }
}