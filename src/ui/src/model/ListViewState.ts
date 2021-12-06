import JSONModel from 'sap/ui/model/json/JSONModel'

/** @namespace bubu-cms.model */
export default class ListViewState {
  public selectedType: string = ''
  public search: string = ''
  public sortingFieldLabel: string = 'name'
  public sortingAscending: boolean = true

  private _model: JSONModel | null = null

  public model (): JSONModel {
    if (this._model === null) {
      this._model = new JSONModel(this)
    }
    return this._model
  }
}
