import JSONModel from 'sap/ui/model/json/JSONModel'
import { StoredRecordType } from '../types/StoredRecord'
import { TypeDefinition } from '../types/TypeDefinition'

/**
 * @namespace bubu-cms.model
 */
export default class Storage extends JSONModel {
  private readonly pSequentialImportCompleted: Promise<void>
  private readonly types: Record<StoredRecordType, TypeDefinition> = {}

  private async init (): Promise<void> {
    return await fetch('/api/allTypes')
      .then(async response => await response.json())
      .then(data => data.forEach((typeDef: TypeDefinition) => {
        this.types[typeDef.name] = typeDef
      }))
  }

  constructor () {
    super()
    this.pSequentialImportCompleted = this.init()
  }
}
