import JSONModel from 'sap/ui/model/json/JSONModel'
import { NAME_REGEX, StoredRecordId, StoredRecord } from '../types/StoredRecord'
import { StoredTypeDefinition } from '../types/TypeDefinition'
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
  private readonly types: Record<StoredRecordId, StoredTypeDefinition> = {}
  private readonly records: StoredRecord[] = []

  private async init (): Promise<void> {
    const typeDefs: StoredTypeDefinition[] = await fetchJson('/api/allTypes')
    typeDefs.forEach((typeDef: StoredTypeDefinition) => {
      this.types[typeDef.id] = typeDef
    })
    const selectableTypes = typeDefs
      .filter(type => type.selectOrder !== undefined)
      .sort((t1, t2) => (t1.selectOrder ?? 0) - (t2.selectOrder ?? 0))
    this.setProperty('/selectableTypes', selectableTypes)
  }

  private getType (record: StoredRecord): StoredTypeDefinition {
    return this.types[record.type]
  }

  public getFirstTypeId (): StoredRecordId {
    return this.getProperty('/selectableTypes/0/id') as StoredRecordId
  }

  // region List handling

  async getListFirstPage (searchOptions: SearchOptions, max: number): Promise<void> {
    this.setProperty('/list/busy', true)
    const result: SearchResult = await fetchJson('/api?' + encodeSearchOptions(searchOptions))
    let length = result.count
    if (length > max) {
      length = max
    }
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

  private static readonly fieldRegex = new RegExp(`\\$\\{(${NAME_REGEX})}`, 'g')

  private interpolate (record: StoredRecord, template: string): string {
    const { fields } = record
    return template.replace(Storage.fieldRegex, (match, fieldName) => fields[fieldName]?.toString() ?? '')
  }

  getRecordIcon (record: StoredRecord): string {
    const { defaultIcon } = this.getType(record)
    if (defaultIcon !== undefined) {
      return this.interpolate(record, defaultIcon)
    }
    return 'sap-icon://business-objects-mobile'
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
