import BaseController from './BaseController'
import Event from 'sap/ui/base/Event'
// import SearchField from 'sap/m/SearchField'
import { StoredRecord, $tag } from '../../../types/StoredRecord'
import ObjectListItem from 'sap/m/ObjectListItem'
import { SearchOptions, SortableField, isSortableField, SortingOptions } from '../../../types/IStorage'
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
    this.getRouter().getRoute('list').attachPatternMatched(this.onDisplayList, this)
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

  private onDisplayList (event: Event): void {
    const searchOptions: SearchOptions = {
      paging: {
        skip: 0,
        top: 20
      },
      refs: {}
    }

    this.queryParameters = event.getParameter('arguments')['?query'] ?? {}

    this.viewState.search = this.queryParameters.search
    if (this.queryParameters.search !== undefined) {
      searchOptions.search = this.queryParameters.search
    }

    searchOptions.sort = this.readSortingCriteria(this.queryParameters.sort)
    this.viewState.sortingFieldLabel = this.i18n(`sort.field.${searchOptions.sort.field}`)
    this.viewState.sortingAscending = searchOptions.sort.ascending

    // binding.refresh()
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
    if (record.type === $tag) {
      this.navigateToListFilteredByTag(record.name)
    } else {
      this.getRouter().navTo('record', record)
    }
  }
}
