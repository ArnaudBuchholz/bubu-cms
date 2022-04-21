import { ILoaderType } from './ILoader'
import { TypeDefinition } from '../types/TypeDefinition'

export class LoaderType implements ILoaderType {
  private _definition: TypeDefinition = {
    name: ''
  }

  selectOrder (position: number): ILoaderType {}

  defaultIcon (value: string | ((record: StoredRecord) => string)): ILoaderType {
    return this
  }

  field (name: string, options: ILoaderTypeFieldOptions): ILoaderType {
    return this
  }

  upsert () => Promise<StoredRecordType> {
      if (isTypeDefinition)

  }

  constructor (name: string) {
    this._definition.name = name
  }
}
