import BaseController from './BaseController'
import MenuItem from 'sap/m/MenuItem'
import HashChanger from 'sap/ui/core/routing/HashChanger'
import JSONModel from 'sap/ui/model/json/JSONModel'
import Sorter from 'sap/ui/model/Sorter'
import Event from 'sap/ui/base/Event'
import SearchField from 'sap/m/SearchField'
import { StoredRecord, $tag } from '../../../types/StoredRecord'
import ObjectListItem from 'sap/m/ObjectListItem'
import { SearchOptions, SortableField, isSortableField } from '../../../types/IStorage'
import ListViewState from '../model/ListViewState'

type QueryParameters = {
  search?: string
  sort?: string
}

/**
 * @namespace bubu-cms.controller
 */
 export default class ListController extends BaseController {
    private viewState: ListViewState = new ListViewState()

    onInit  () {
      this.getRouter().getRoute('list').attachPatternMatched(this.onDisplayList, this)
      this.byId('records').focus()
      this.getView().setModel(this.viewState, 'state')
    }

    private onDisplayList (event: Event) {
      const queryParameters: QueryParameters = event.getParameter('arguments')['?query'] ?? {}
      const searchOptions: SearchOptions = {
        paging: {
          skip: 0,
          top: 20
        },
        refs: {}
      }
      this.viewState.search = queryParameters.search
      if (queryParameters.search !== undefined) {
        searchOptions.search = queryParameters.search
      }

      const sort = queryParameters.sort ?? 'nameAsc'
      let [, sortingFieldName, sortingAscending] = /(\w+)(Asc|Desc)/.exec(sort) ?? [, 'name', 'Asc']

      if (!isSortableField(sortingFieldName)) {
        sortingFieldName = 'name' as SortableField
      }

      this.viewState.sortingFieldLabel = this.i18n(`sort.field.${sortingFieldName}`)
      this.viewState.sortingAscending = sortingAscending === 'Asc'
      searchOptions.sort = {
        field: sortingFieldName,
        ascending: sortingAscending === 'Asc'
      }



      const sortButton = this.byId('sortButton')
      this.byId('sortMenu').getItems().every(function (menuItem) {
        if (menuItem.getId().indexOf(sort) !== -1) {
          sortButton.setIcon(menuItem.getIcon())
          sortButton.setText(menuItem.getText())
          return false
        }
        return true
      })

      // binding.sort(new Sorter(sortParts[1], sortParts[2] === 'Desc'))
      // binding.refresh()
    }

    private reload () {
      this.getRouter().navTo('list', {
        query: this.queryParameters
      }, true)
    }

    onSearch (event: Event) {
      this.queryParameters.search = 
      this._setQueryParameter('search', this.escapeSearch(this.byId('search').getValue()))
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
        // this._setQueryParameter('sort', sort[0])
      }
    }

    onRecordPress (event: Event) {
      const record: StoredRecord = (event.getSource() as ObjectListItem).getBindingContext().getObject() as StoredRecord
      if (record.type === $tag) {
        // this._setQueryParameter('search', this.escapeSearch('#' + record.name))
      } else {
        this.getRouter().navTo('record', record)
      }
    }
}