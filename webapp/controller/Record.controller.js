/* global sap, history, alert */
sap.ui.define([
  './BaseController',
  'sap/m/Token',
  'sap/ui/model/json/JSONModel',
  'sap/m/MessageBox',
  'sap/ui/core/Fragment',
  'sap/ui/core/CustomData'

], function (BaseController, Token, JSONModel, MessageBox, Fragment, CustomData) {
  'use strict'

  return BaseController.extend('bubu-cms.controller.Record', {

    // content API for records' sections
    content: {
      translateTag: function (tag) {
        return this.i18n('tag', tag) || tag
      },
      navigateToListFilteredByTag: function (tag) {
        return this._navigateToListFilteredByTag(tag)
      },
      redirect: function (url) {
        sap.m.URLHelper.redirect(url)
      }
    },

    _buildBoundContent: function () {
      var boundContent = {}
      Object.keys(this.content).forEach(function (method) {
        boundContent[method] = this.content[method].bind(this)
      }, this)
      this.content = boundContent
    },

    onInit: function () {
      this._getRouter().getRoute('record').attachPatternMatched(this._onDisplayRecord, this)
      this._buildBoundContent()
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

    _showSection: function (section) {
      this.byId('page').setSelectedSection(section)
    },

    _isContentSectionVisible: function (expectedType, record) {
        return record.type === expectedType && this.getModel('content').getProperty('/recordId')
    },

    _displayContent: function (record) {
      var content = record.toContent
      if (content.__ref) {
        content = this.getView().getModel().getObject('/' + content.__ref)
      }
      this._setContent(JSON.parse(content.data))
      var objectPage = this.byId('page')
      var section = objectPage.getSections().filter(function (candidate) {
        return candidate.getCustomData().some(function (customData) {
          return customData.getKey() === 'recordType' && customData.getValue() === record.type
        })
      })[0]
      if (section) {
        this._showSection(section)
      } else {
        Fragment.load({
          id: 'section.json.' + record.type,
          name: 'bubu-cms/api/' + record.type,
          controller: this
        }).then(function (section) {
          this.getView().addDependent(section)
          section.bindProperty('visible', {
            path: '',
            formatter: this._isContentSectionVisible.bind(section, record.type)
          })
          section.addCustomData(new CustomData({
            key: 'recordType',
            value: record.type
          }))
          this.byId('page').insertSection(section, 0)
          this._showSection(section)
        }.bind(this))
      }
    },

    _handleContent: function (record) {
      if (!record.toContent) {
        this._setContent({})
        return
      }
      return this._displayContent(record)
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

    _navigateToListFilteredByTag: function (tag) {
      this._getRouter().navTo('list', {
        query: {
          search: this.escapeSearch('#' + tag)
        }
      }, false)
    },

    onTagPress: function (event) {
      var tag = event.getSource().getBindingContext('tags').getObject()
      this._navigateToListFilteredByTag(tag.id)
    }

  })
})
