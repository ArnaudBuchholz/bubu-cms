import colors from 'colors/safe'
import { LogType, ILoader } from './ILoader'
import { IStorage } from '../types/IStorage'
import { StorableRecord, StoredRecordId, $type, $tag } from '../types/StoredRecord'
import { findTypeDefinition, StoredTypeDefinition, TypeName } from '../types/TypeDefinition'
import { create } from '../api/create'
import { SearchResult } from 'src/ui/src/types/IStorage'

const logTypes: Record<LogType, string> = {
  [LogType.info]: '💬',
  [LogType.warning]: '⚠️',
  [LogType.error]: '❌',
  [LogType.fatal]: '💀'
}

export class Loader implements ILoader {
  private readonly storage: IStorage

  log (type: LogType, module: string, message: string, detail?: object): void {
    const params: any[] = [
      logTypes[type],
      colors.magenta(module),
      colors.gray(message),
      detail
    ]
    if ([LogType.error, LogType.fatal].includes(type)) {
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
        [$type]: [$tag]
      },
      search: tagName,
      fullNameOnly: true
    })
    if (result.count === 1) {
      return result.records[0].id
    }
    return null
  }

  async create (record: StorableRecord): Promise<StoredRecordId> {
    return await create(this.storage, record)
  }

  constructor (storage: IStorage) {
    this.storage = storage
  }
}
