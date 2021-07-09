import UIComponent from 'sap/ui/core/UIComponent'

/**
 * @namespace bubu-cms
 */
export default class Component extends UIComponent {
  public static metadata = {
    manifest: 'json'
  }

  public init () {
    super.init()
    this.getRouter().initialize()
  }
}
