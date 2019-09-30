/* global sap, history, alert */
sap.ui.define([
  './BaseController',
  'sap/m/Token',
  'sap/ui/model/json/JSONModel',
  'sap/m/MessageBox'

], function (BaseController, Token, JSONModel, MessageBox) {
  'use strict'

  var URLHelper = sap.m.URLHelper

  return BaseController.extend('bubu-cms.controller.Record', {

    onInit: function () {
      this._getRouter().getRoute('record').attachPatternMatched(this._onDisplayRecord, this)
    },

    _onDisplayRecord: function (event) {
      var recordId = event.getParameter('arguments').recordId
      var sPath = '/' + this.getOwnerComponent().getModel().createKey('RecordSet', {
        id: recordId
      })
      var page = this.byId('page')
      this.getView().bindElement({
        path: sPath,
        parameters: {
          expand: 'toContent'
        },
        events: {
          change: this._onBindingChanged.bind(this),
          dataRequested: function () {
            page.setBusy(true)
          }
        }
      })
    },

    _onBindingChanged: function () {
      var page = this.byId('page')
      var binding = this.getView().getElementBinding()
      var record
      if (!binding.getBoundContext()) {
        MessageBox.show(this.i18n('record', 'notLoaded'), {
          icon: MessageBox.Icon.ERROR,
          title: this.i18n('db', 'title'),
          actions: [MessageBox.Action.CLOSE],
          onClose: this.onBack.bind(this)
        })
        return
      }
      record = binding.getBoundContext().getObject()
      page.setModel(new JSONModel({
        list: record.tags.split(' ').map(function (tag) {
          return {
            id: tag,
            name: this.i18n('tag', tag) || tag
          }
        }, this)
      }), 'tags')
      if (record.toContent.mimeType === 'application/json') {
        alert(record.type)
      }
      // page.setSelectedSection(this.byId('htmlSection').getId())
      // this.byId('htmlContent').invalidate()
      page.setBusy(false)
    },

    onBack: function () {
      if (history.length > 1) {
        history.back()
      } else {
        this._getRouter().navTo('list', {}, true)
      }
    },

    onProperties: function () {
      this.byId('page').setSelectedSection(this.byId('properties').getId())
    },

    onTagPress: function (event) {
      var tag = event.getSource().getBindingContext('tags').getObject()
      this._getRouter().navTo('list', {
        query: {
          search: this.escapeSearch('#' + tag.id)
        }
      }, false)
    }

  })
})
