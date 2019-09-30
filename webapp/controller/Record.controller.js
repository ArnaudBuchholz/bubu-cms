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

    _setContent: function (content) {
      this.getView().setModel(new JSONModel(content), 'content')
    },

    _extractContent: function (record) {
      var content = record.toContent
      if (content.__ref) {
        content = this.getView().getModel().getObject('/' + content.__ref)
      }
      this._setContent(content)
      // alert(record.type + ' ' + content.mimeType)
    },

    _handleContent: function (record) {
      if (!record.toContent) {
        this._setContent({})
        return
      }
      return this._extractContent(record)
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
      this._handleContent(record);
      page.setBusy(false)
    },

    onBack: function () {
      if (history.length > 1) {
        history.back()
      } else {
        this._getRouter().navTo('list', {}, true)
      }
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
