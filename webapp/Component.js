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
      this.getModel().metadataLoaded().then(function () {
        this.getRouter().initialize()
      }.bind(this))
    }

  })
})
