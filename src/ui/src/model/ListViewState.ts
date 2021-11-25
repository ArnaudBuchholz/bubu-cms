import JSONModel from 'sap/ui/model/json/JSONModel'

/**
 * @namespace bubu-cms.controller
 */
export default class ListViewState extends JSONModel {
  public search: undefined | string = ''
  public sortingFieldLabel: undefined | string = 'name'
  public sortingAscending: undefined | boolean = true
}

Object.getOwnPropertyNames(ListViewState.prototype).forEach(name => {
  const defaultValue: any = (ListViewState.prototype as Record<string, any>)[name]
  Object.defineProperty(ListViewState.prototype, name, {
    get: function (): any {
      return this.getProperty(`/${name}`) ?? defaultValue
    },
    set: function (value: any) {
      this.setProperty(`/${name}`, value ?? defaultValue)
    }
  })
})
