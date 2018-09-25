sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"

], function(Controller, JSONModel, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("bubu-cms.controller.App", {

		dbI18n: function (key, params) {
			if (!this._dbI18n) {
				this._dbI18n = this.getView().getModel("db.i18n").getResourceBundle();
			}
			return this._dbI18n.getText(key, params);
		},

		formatNumberUnit: function (type) {
			return this.dbI18n(type + ".numberUnit");
		},

		formatStatus1: function (type) {
			return this.dbI18n(type + ".status1");
		},

		formatStatus2: function (type) {
			return this.dbI18n(type + ".status2");
		},

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
