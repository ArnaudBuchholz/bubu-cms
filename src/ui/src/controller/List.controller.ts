import BaseController from './BaseController'
import MenuItem from 'sap/m/MenuItem'
import HashChanger from 'sap/ui/core/routing/HashChanger'
import JSONModel from 'sap/ui/model/json/JSONModel'
import Sorter from 'sap/ui/model/Sorter'
import Event from 'sap/ui/base/Event'
import SearchField from 'sap/m/SearchField'
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

  onInit () {
    this.getRouter().getRoute('list').attachPatternMatched(this.onDisplayList, this)
    this.byId('records').focus()
    this.getView().setModel(this.viewState, 'state')
  }

  private queryParameters: QueryParameters = {}

  private readSortingCriteria (criteria: undefined | string): SortingOptions {
    const [, rawFieldName, rawAscending] = /(\w+)(Asc|Desc)/.exec(criteria ?? 'nameAsc') ?? [, 'name', 'Asc']

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

  private onDisplayList (event: Event) {
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

    // binding.sort(new Sorter(sortParts[1], sortParts[2] === 'Desc'))
    // binding.refresh()
  }

  private reload () {
    this.getRouter().navTo('list', {
      query: this.queryParameters
    }, undefined, true)
  }

  onSearch (event: Event) {
    this.queryParameters.search = this.viewState.search
    this.reload()
  }

  /*
    onSuggest (event: Event) {
      (event.getSource() as SearchField).suggest()
    }
  */

  onSort (event: Event) {
    const sortItem = event.getParameter('item')
    const sort: null | RegExpExecArray = /(\w+)(Asc|Desc)/.exec(sortItem.getId())
    if (sort !== null) {
      this.queryParameters.sort = sort[0]
      this.reload()
    }
  }

  onRecordPress (event: Event) {
    const record: StoredRecord = (event.getSource() as ObjectListItem).getBindingContext().getObject() as StoredRecord
    if (record.type === $tag) {
      this.navigateToListFilteredByTag(record.name)
    } else {
      this.getRouter().navTo('record', record)
    }
  }
}
