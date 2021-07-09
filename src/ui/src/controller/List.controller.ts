/* global sap */
sap.ui.define([
  './BaseController',
  'sap/m/MenuItem',
  'sap/ui/core/routing/HashChanger',
  'sap/ui/model/json/JSONModel',
  'sap/ui/model/Sorter'

], function (BaseController, MenuItem, HashChanger, JSONModel, Sorter) {
  'use strict'

  return BaseController.extend('bubu-cms.controller.List', {

    _buildSortingMenu: function () {
      const sortMenu = this.byId('sortMenu')

      const order = ['name', 'rating', 'created', 'modified']
      this.getOwnerComponent().getModel().getServiceMetadata()
        .dataServices.schema[0].entityType
        .filter(function (entity) {
          return entity.name === 'Record'
        })[0].property
        .filter(function (property) {
          return property.extensions.some(function (extension) {
            return extension.name === 'sortable' && extension.value === 'true'
          })
        })
        .map(function (property) {
          return property.name
        })
        .sort(function (name1, name2) {
          const pos1 = order.indexOf(name1)

          const pos2 = order.indexOf(name2)
          if (pos1 !== -1 && pos2 !== -1) {
            return pos1 - pos2 // Expected ones are sorted according to the order array
          }
          if (pos1 === -1 && pos2 === -1) {
            return name1.localeCompare(name2) // Non expected are sorted alphabetically...
          }
          if (pos1 === -1) {
            return 1 // ...at the end of the list
          }
          return -1
        })
        .forEach(function (name) {
          sortMenu.addItem(new MenuItem({
            id: name + 'Asc',
            text: '{i18n>sort.' + name + '}',
            icon: 'sap-icon://sort-ascending'
          }))
          sortMenu.addItem(new MenuItem({
            id: name + 'Desc',
            text: '{i18n>sort.' + name + '}',
            icon: 'sap-icon://sort-descending'
          }))
        })
    },

    onInit: function () {
      this._getRouter().getRoute('list').attachPatternMatched(this._onDisplayList, this)
      this._buildSortingMenu()
      this.byId('records').focus()
    },

    _queryParameters: {},

    _onDisplayList: function (event) {
      const binding = this.byId('records').getBinding('items')
      this._queryParameters = event.getParameter('arguments')['?query'] || {}
      if (this._queryParameters.search) {
        const unescapedSearch = this.unescapeSearch(this._queryParameters.search)
        this.byId('search').setValue(unescapedSearch)
        binding.sCustomParams = 'search=' + encodeURIComponent(unescapedSearch)
      } else {
        this.byId('search').setValue('')
        binding.sCustomParams = ''
      }
      const sort = this._queryParameters.sort || 'nameAsc'

      const sortParts = /(\w+)(Asc|Desc)/.exec(sort)

      const sortButton = this.byId('sortButton')
      this.byId('sortMenu').getItems().every(function (menuItem) {
        if (menuItem.getId().indexOf(sort) !== -1) {
          sortButton.setIcon(menuItem.getIcon())
          sortButton.setText(menuItem.getText())
          return false
        }
        return true
      })
      binding.sort(new Sorter(sortParts[1], sortParts[2] === 'Desc'))
      binding.refresh()
    },

    _setQueryParameter: function (name, value) {
      if (value) {
        this._queryParameters[name] = value
      } else {
        delete this._queryParameters[name]
      }
      this._getRouter().navTo('list', {
        query: this._queryParameters
      }, true)
    },

    onSearch: function (event) {
      this._setQueryParameter('search', this.escapeSearch(this.byId('search').getValue()))
    },

    onSuggest: function (event) {
      event.getSource().suggest()
    },

    onSort: function (event) {
      const sortItem = event.getParameter('item')

      const sort = /(\w+)(Asc|Desc)/.exec(sortItem.getId())
      this._setQueryParameter('sort', sort[0])
    },

    onRecordPress: function (event) {
      const record = event.getSource().getBindingContext().getObject()
      if (record.type === 'tag') {
        this._setQueryParameter('search', this.escapeSearch('#' + record.name))
      } else {
        this._getRouter().navTo('record', {
          recordId: record.id
        })
      }
    }

  })
})
