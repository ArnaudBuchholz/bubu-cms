import UIComponent from 'sap/ui/core/UIComponent'
import JSONModel from 'sap/ui/model/json/JSONModel'
import Log from 'sap/base/Log'

/**
 * @namespace bubu-cms
 */
export default class Component extends UIComponent {
  public static metadata = {
    manifest: 'json'
  }

  public init (): void {
    super.init()
    const storage = this.getModel() as JSONModel
    storage.dataLoaded()
      .then(() => this.getRouter().initialize())
      .catch(reason => Log.error('Failed to initialize storage', reason.toString()))
  }
}
