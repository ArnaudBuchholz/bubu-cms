sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter"

], function(Controller, JSONModel, Sorter) {
	"use strict";

	return Controller.extend("bubu-cms.controller.List", {

		getTextIfInI18n: function (resourceBundle, key, params) {
			if (resourceBundle.hasText(key)) {
				return resourceBundle.getText(key, params);
			}
		},

		dbI18n: function (key, params) {
			if (!this._dbI18n) {
				this._dbI18n = this.getView().getModel("db.i18n").getResourceBundle();
			}
			return this.getTextIfInI18n(this._dbI18n, key, params);
		},

		uiI18n: function (key, params) {
			if (!this._uiI18n) {
				this._uiI18n = this.getView().getModel("i18n").getResourceBundle();
			}
			return this.getTextIfInI18n(this._uiI18n, key, params);
		},

		i18n: function (type, key, parameters) {
			var translationKey = type + "." + key,
				result = this.dbI18n(translationKey, parameters);
			if (undefined === result) {
				result = this.uiI18n(translationKey, parameters);
			}
			return result;
		},

		formatIcon: function (type, icon) {
			if (icon) {
				return icon;
			}
			var defaultIcon = this.i18n(type, "defaultIcon");
			if (defaultIcon) {
				return "sap-icon://" + defaultIcon;
			}
			return "";
		},

		formatNumberUnit: function (type) {
			return this.i18n(type, "numberUnit");
		},

		formatStatus1: function (type) {
			return this.i18n(type, "status1");
		},

		formatStatus2: function (type) {
			return this.i18n(type, "status2");
		},

		renderRating: function (value) {
			return new Array(value + 1).join("\u2605")
				+ new Array(6 - value).join("\u2606");
		},

		onSearch: function(event) {
			var binding = this.byId("records").getBinding("items"),
				search = this.byId("search").getValue();
			if (search) {
				binding.sCustomParams = "search=" + encodeURIComponent(search);
			} else {
				binding.sCustomParams = "";
			}
			binding.refresh();
		},

		onSort: function (event) {
			var sortItem = event.getParameter("item"),
				sort = /(\w+)(Asc|Desc)/.exec(sortItem.getId()),
				sortMenu = this.byId("sort"),
				binding = this.byId("records").getBinding("items");
			sortMenu.setIcon(sortItem.getIcon());
			sortMenu.setText(sortItem.getText());
			binding.sort(new Sorter(sort[1], sort[2] === "Desc"));
		},

		onRecordPress: function(event) {
			var record = event.getSource().getBindingContext().getObject();
			if (record.type === "tag") {
				this.byId("search").setValue("#" + record.name);
				this.onSearch();
			}
		}

	});

});
