import JSONModel from 'sap/ui/model/json/JSONModel'

/** @namespace bubu-cms.model */
export default class ListViewState extends JSONModel {
  public selectedType: undefined | string = ''
  public search: undefined | string = ''
  public sortingFieldLabel: undefined | string = 'name'
  public sortingAscending: undefined | boolean = true
}

const mappings: any = {
  selectedType: '',
  search: '',
  sortingFieldLabel: 'name',
  sortingAscending: true
}

Object.keys(mappings).forEach(name => {
  const defaultValue: any = mappings[name]
  Object.defineProperty(ListViewState.prototype, name, {
    get: function (): any {
      return this.getProperty(`/${name}`) ?? defaultValue
    },
    set: function (value: any) {
      this.setProperty(`/${name}`, value ?? defaultValue)
    }
  })
})
