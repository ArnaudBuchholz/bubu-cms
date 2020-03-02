/* global sap */
sap.ui.define([
  'sap/ui/core/UIComponent'
], function (UIComponent) {
  'use strict'

  return UIComponent.extend('bubu-cms.Component', {

    metadata: {
      manifest: 'json'
    },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments)
      Promise.all([
        this.getModel().metadataLoaded(),
        this.getModel('i18n').getResourceBundle(),
        this.getModel('db.i18n').getResourceBundle()
      ])
        .then(function () {
          this.getRouter().initialize()
        }.bind(this))
    }

  })
})
