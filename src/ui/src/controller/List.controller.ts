import BaseController from './BaseController'
import Event from 'sap/ui/base/Event'
// import SearchField from 'sap/m/SearchField'
import { StoredRecord } from '../types/StoredRecord'
import ObjectListItem from 'sap/m/ObjectListItem'
import { SearchOptions, SortableField, isSortableField, SortingOptions } from '../types/IStorage'
import ListViewState from '../model/ListViewState'

interface QueryParameters {
  search?: string
  sort?: string
}

/**
 * @namespace bubu-cms.controller
 */
export default class ListController extends BaseController {
  private viewState: ListViewState = new ListViewState()

  onInit (): void {
    this.getRouter().getRoute('list').attachPatternMatched(this.onRefreshList, this)
    this.byId('records').focus()
    this.getView().setModel(this.viewState, 'state')
  }

  private queryParameters: QueryParameters = {}

  private readSortingCriteria (criteria: undefined | string): SortingOptions {
    const [, rawFieldName, rawAscending] = /(\w+)(Asc|Desc)/.exec(criteria ?? 'nameAsc') ?? [0, 'name', 'Asc']

    let field: SortableField
    if (!isSortableField(rawFieldName)) {
      field = 'name'
    } else {
      field = rawFieldName
    }
    const ascending = rawAscending === 'Asc'
    return {
      field,
      ascending
    }
  }

  private buildSearchOptions (skip: number = 0): SearchOptions {
    const { page } = this.getSettings().list
    const searchOptions: SearchOptions = {
      paging: {
        skip,
        top: page
      }
    }
    if (this.queryParameters.search !== undefined) {
      searchOptions.search = this.queryParameters.search
    }
    searchOptions.sort = this.readSortingCriteria(this.queryParameters.sort)
    return searchOptions
  }

  private async onRefreshList (event: Event): Promise<void> {
    this.queryParameters = event.getParameter('arguments')['?query'] ?? {}
    this.viewState.search = this.queryParameters.search
    const searchOptions = this.buildSearchOptions()
    const { max } = this.getSettings().list
    this.viewState.sortingFieldLabel = await this.i18n(`sort.field.${searchOptions.sort?.field ?? ''}`)
    this.viewState.sortingAscending = searchOptions.sort?.ascending ?? true
    return await this.getStorage().getListFirstPage(searchOptions, max)
  }

  private async onUpdateStarted (event: Event): Promise<void> {
    const reason = event.getParameter('reason') as string
    const actual = event.getParameter('actual') as number
    if (reason === 'Growing') {
      const searchOptions = this.buildSearchOptions(actual)
      return await this.getStorage().getListNextPage(searchOptions)
    }
  }

  private reload (): void {
    this.getRouter().navTo('list', {
      query: this.queryParameters
    }, undefined, true)
  }

  onSearch (event: Event): void {
    this.queryParameters.search = this.viewState.search
    this.reload()
  }

  /*
    onSuggest (event: Event) {
      (event.getSource() as SearchField).suggest()
    }
  */

  onSort (event: Event): void {
    const sortItem = event.getParameter('item')
    const sort: null | RegExpExecArray = /(\w+)(Asc|Desc)/.exec(sortItem.getId())
    if (sort !== null) {
      this.queryParameters.sort = sort[0]
      this.reload()
    }
  }

  onRecordPress (event: Event): void {
    const record: StoredRecord = (event.getSource() as ObjectListItem).getBindingContext().getObject() as StoredRecord
    if (record.type === '$tag') {
      this.navigateToListFilteredByTag(record.name)
    } else {
      this.getRouter().navTo('record', record)
    }
  }
}
