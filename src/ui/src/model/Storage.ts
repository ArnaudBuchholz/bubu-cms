import JSONModel from 'sap/ui/model/json/JSONModel'
import { StoredRecordType, StoredRecord } from '../types/StoredRecord'
import { TypeDefinition } from '../types/TypeDefinition'
import { SearchOptions, encodeSearchOptions, SearchResult } from '../types/IStorage'

async function fetchJson<T> (url: string): Promise<T> {
  return await fetch(url)
    .then(async response => await response.json())
}
/**
 * @namespace bubu-cms.model
 */
export default class Storage extends JSONModel {
  private readonly pSequentialImportCompleted: Promise<void>
  private readonly types: Record<StoredRecordType, TypeDefinition> = {}
  private readonly records: StoredRecord[] = []

  private async init (): Promise<void> {
    const typeDefs: TypeDefinition[] = await fetchJson('/api/allTypes')
    typeDefs.forEach((typeDef: TypeDefinition) => {
      this.types[typeDef.name] = typeDef
    })
  }

  async getFirstPage (searchOptions: SearchOptions): Promise<void> {
    this.setProperty('/list/busy', true)
    const result: SearchResult = await fetchJson('/api?' + encodeSearchOptions(searchOptions))
    this.records.length = 0
    this.records.push(...result.records)
    this.setProperty('/list/count', result.count)
    this.setProperty('/list/busy', false)
  }

  constructor () {
    super()
    this.setData({
      list: {
        busy: false,
        count: 0,
        records: this.records
      }
    })
    this.pSequentialImportCompleted = this.init()
  }
}
