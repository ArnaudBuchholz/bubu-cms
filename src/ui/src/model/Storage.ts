import JSONModel from 'sap/ui/model/json/JSONModel'

/**
 * @namespace bubu-cms.model
 */
export default class Storage extends JSONModel {
  private readonly pSequentialImportCompleted: Promise<void>

  private async init (): Promise<void> {
    return await fetch('/api/allTypes')
      .then(async response => await response.json())
      .then(data => {
        console.log(data)
      })
  }

  constructor () {
    super()
    this.pSequentialImportCompleted = this.init()
  }
}
