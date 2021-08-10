import JSONModel from 'sap/ui/model/json/JSONModel'

export default class ListState extends JSONModel {
  get search (): string {
    return this.getProperty('/search') ?? ''
  }

  set search (value: undefined | string) {
    this.setProperty('/search', value ?? '')
  }

  get sortingFieldLabel () : string {
    return this.getProperty('/sortingFieldLabel') ?? ''
  }

  set sortingFieldLabel (value: undefined | string) {
    this.setProperty('/sortingFieldLabel', value ?? '')
  }

  get sortingAscending () : boolean {
    return this.getProperty('/sortingAscending') !== false
  }

  set sortingAscending (value: undefined | boolean) {
    this.setProperty('/sortingAscending', value ?? true)
  }
}
