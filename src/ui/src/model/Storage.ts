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

  // region List handling

  async getListFirstPage (searchOptions: SearchOptions, max: number): Promise<void> {
    this.setProperty('/list/busy', true)
    const result: SearchResult = await fetchJson('/api?' + encodeSearchOptions(searchOptions))
    const length = Math.max(result.count, max)
    this.records.length = 0
    this.records.push(...result.records)
    this.records.length = length
    this.records.fill({
      id: '',
      type: '$filler',
      name: '',
      fields: {},
      refs: {}
    }, searchOptions.paging.top)
    this.setProperty('/list/count', result.count)
    this.setProperty('/list/busy', false)
  }

  async getListNextPage (searchOptions: SearchOptions): Promise<void> {
    this.setProperty('/list/busy', true)
    const result: SearchResult = await fetchJson('/api?' + encodeSearchOptions(searchOptions))
    result.records.forEach((record: StoredRecord, index: number) => {
      this.records[searchOptions.paging.skip + index] = record
    })
    this.setProperty('/list/busy', false)
  }

  // endregion List handling

  // region Formating

  getRecordIcon (record: StoredRecord): string {
    return 'sap-icon://business-objects-mobile'
/*
    // if ()
    //   if (icon) {
    //     return icon
    //   }
    //   const defaultIcon = this.i18n(type, 'defaultIcon')
    //   if (defaultIcon) {
    //     return 'sap-icon://' + defaultIcon
    //   }
    //   return ''
*/
  }
 

  // endregion

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
