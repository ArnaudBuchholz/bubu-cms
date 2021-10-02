import colors from 'colors/safe'
import { LogType, ILoader } from './ILoader'
import { IStorage } from '../types/IStorage'
import { StorableRecord, StoredRecordId } from '../types/StoredRecord'
import { StoredTypeDefinition, TypeName } from '../types/TypeDefinition'
import { create } from '../api/create'

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
    console.log(...params)
  }

  async getType (typeName: TypeName): Promise<StoredTypeDefinition | null> {
    return null
  }

  async getTagId (tagName: string): Promise<StoredRecordId | null> {
    return null
  }

  async create (record: StorableRecord): Promise<StoredRecordId> {
    return await create(this.storage, record)
  }

  constructor (storage: IStorage) {
    this.storage = storage
  }
}
