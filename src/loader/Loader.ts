import colors from 'colors/safe'
import { LogType, ILoader } from './ILoader'
import { IStorage, SearchOptions, SearchResult } from '../types/IStorage'
import { StorableRecord, StoredRecordId, StoredRecord, STOREDRECORDTYPE_TYPE, STOREDRECORDTYPE_TAG } from '../types/StoredRecord'
import { findTypeDefinition, StoredTypeDefinition, TypeName } from '../types/TypeDefinition'
import { create } from '../api/create'
import { Configuration } from './types'
import { Configuration as ReserveConfiguration } from 'reserve'
import { buildConfiguration } from './reserve'
import { update } from '../api/update'
import { deleteRecord } from '../api/delete'

const logTypes: Record<LogType, string> = {
  info: '💬',
  warning: '⚠️',
  error: '❌',
  fatal: '💀'
}

const custom: string = '⚙️'

export class Loader implements ILoader {
  // region ILoader

  log (type: LogType, module: string, message?: string, detail?: object): void {
    if (message === undefined) {
      message = module
      module = ''
    }
    if (module === '') {
      module = custom
    }
    const params: any[] = [
      logTypes[type],
      colors.magenta(module),
      colors.gray(message)
    ]
    if (detail !== undefined) {
      params.push(detail)
    }
    if (['error', 'fatal'].includes(type)) {
      console.error(...params)
    } else {
      console.log(...params)
    }
  }

  async getType (typeName: TypeName): Promise<StoredTypeDefinition | null> {
    return await findTypeDefinition(this.storage, typeName)
  }

  async getTagId (tagName: string): Promise<StoredRecordId | null> {
    const result: SearchResult = await this.storage.search({
      paging: {
        skip: 0,
        top: 1
      },
      refs: {
        [STOREDRECORDTYPE_TYPE]: [STOREDRECORDTYPE_TAG]
      },
      search: tagName,
      fullNameOnly: true
    })
    if (result.count === 1) {
      return result.records[0].id
    }
    return null
  }

  async search (options: SearchOptions): Promise<SearchResult> {
    return await this.storage.search(options)
  }

  async create (record: StorableRecord): Promise<StoredRecordId> {
    return await create(this.storage, record)
  }

  async update (record: StoredRecord): Promise<void> {
    return await update(this.storage, record)
  }

  async delete (record: StoredRecord): Promise<void> {
    return await deleteRecord(this.storage, record.type, record.id)
  }

  // endregion

  buildReserveConfiguration (): ReserveConfiguration {
    return buildConfiguration(this)
  }

  constructor (public readonly configuration: Configuration, public readonly storage: IStorage) {
  }
}
