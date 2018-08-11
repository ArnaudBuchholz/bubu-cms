sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"

], function(Controller, JSONModel, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("bubu-cms.controller.App", {

		onInit: function() {
			var oI18nResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			this._i18n = oI18nResourceBundle.getText.bind(oI18nResourceBundle);
		},

		onSearch: function(oEvent) {
		},

		onItemPress: function(oEvent) {
		}

	});

});
