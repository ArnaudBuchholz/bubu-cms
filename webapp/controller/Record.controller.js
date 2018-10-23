/* global sap, history, alert */
sap.ui.define([
  './BaseController',
  'sap/m/Token',
  'sap/ui/model/json/JSONModel'

], function (BaseController, Token, JSONModel) {
  'use strict'

  var URLHelper = sap.m.URLHelper
  var REGEX_PHONENUMBER = /(?:\+?(\d{1,3}))?[- (]*(\d{3})[- )]*(\d{3})[- ]*(\d{4})(?: *x(\d+))?\b/

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
        alert('problem')
      }
      record = binding.getBoundContext().getObject()
      page.setModel(new JSONModel({
        list: record.tags.split(' ').map(function (tag) {
          return {
            editable: tag !== record.type,
            id: tag
          }
        })
      }), 'tags')
      page.setSelectedSection(this.byId('htmlSection').getId())
      this.byId('htmlContent').invalidate()
      page.setBusy(false)
    },

    onBack: function () {
      history.back()
    },

    onProperties: function () {
      this.byId('page').setSelectedSection(this.byId('properties').getId())
    },

    onPressStatus: function (event) {
      var statusText = event.getSource().getText()

      var phone = REGEX_PHONENUMBER.exec(statusText)

      var country
      if (phone) {
        country = phone[0] || '1'
        URLHelper.triggerTel('+' + country + phone[2] + phone[3] + phone[4])
      }
    }

  })
})
