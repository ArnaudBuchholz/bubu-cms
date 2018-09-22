sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"

], function(Controller, JSONModel, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("bubu-cms.controller.App", {

		renderRating: function (value) {
			return new Array(value + 1).join("\u2605")
				+ new Array(6 - value).join("\u2606");
		},

		onInit: function() {
			var oI18nResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			this._i18n = oI18nResourceBundle.getText.bind(oI18nResourceBundle);
		},

		onSearch: function(oEvent) {
		},

		onRecordPress: function(oEvent) {
		}

	});

});
