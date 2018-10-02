sap.ui.define([
	"sap/m/MenuItem",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/HashChanger",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",

], function(MenuItem, Controller, HashChanger, JSONModel, Sorter) {
	"use strict";

	return Controller.extend("bubu-cms.controller.List", {

		_getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		_buildSortingMenu: function () {
			var sortMenu = this.byId("sortMenu"),
				order = ["name", "rating", "created", "modified"];
			this.getOwnerComponent().getModel().getServiceMetadata()
				.dataServices.schema[0].entityType
				.filter(function (entity) {
					return entity.name === "Record";
				})[0].property
				.filter(function (property) {
					return property.extensions.some(function (extension) {
						return extension.name === "sortable" && extension.value === "true";
					});
				})
				.map(function (property) {
					return property.name;
				})
				.sort(function (name1, name2) {
					var pos1 = order.indexOf(name1),
						pos2 = order.indexOf(name2);
					if (pos1 !== -1 && pos2 !== -1) {
						return pos1 - pos2; // Expected ones are sorted according to the order array
					}
					if (pos1 === -1 && pos2 === -1) {
						return name1.localeCompare(name2); // Non expected are sorted alphabetically...
					}
					if (pos1 === -1) {
						return 1; // ...at the end of the list
					}
					return -1;
				})
				.forEach(function (name) {
					sortMenu.addItem(new MenuItem({
						id: name + "Asc",
						text: "{i18n>sort." + name + "}",
						icon: "sap-icon://sort-ascending"
					}));
					sortMenu.addItem(new MenuItem({
						id: name + "Desc",
						text: "{i18n>sort." + name + "}",
						icon: "sap-icon://sort-descending"
					}));
				});
		},

		onInit: function () {
			this._getRouter().getRoute("list").attachPatternMatched(this._onDisplayList, this);
			this._buildSortingMenu();
		},

		_queryParameters: {},

		_onDisplayList: function (event) {
			var binding = this.byId("records").getBinding("items");
			this._queryParameters = event.getParameter("arguments")["?query"] || {};
			if (this._queryParameters.search) {
				this.byId("search").setValue(this._queryParameters.search);
				binding.sCustomParams = "search=" + encodeURIComponent(this._queryParameters.search);
			} else {
				this.byId("search").setValue("");
				binding.sCustomParams = "";
			}
			var sort = this._queryParameters.sort || "nameAsc",
				sortParts = /(\w+)(Asc|Desc)/.exec(sort),
				sortButton = this.byId("sortButton");
			this.byId("sortMenu").getItems().every(function (menuItem) {
				if (menuItem.getId().indexOf(sort) !== -1) {
					sortButton.setIcon(menuItem.getIcon());
					sortButton.setText(menuItem.getText());
					return false;
				}
				return true;
			});
			binding.sort(new Sorter(sortParts[1], sortParts[2] === "Desc"));
			binding.refresh();
		},

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

		_setQueryParameter: function (name, value) {
			if (value) {
				this._queryParameters[name] = value;
			} else {
				delete this._queryParameters[name];
			}
			this._getRouter().navTo("list", {
				query: this._queryParameters
			}, true);
		},

		onSearch: function(event) {
			this._setQueryParameter("search", this.byId("search").getValue());
		},

		onSort: function (event) {
			var sortItem = event.getParameter("item"),
				sort = /(\w+)(Asc|Desc)/.exec(sortItem.getId());
			this._setQueryParameter("sort", sort[0]);
		},

		onRecordPress: function(event) {
			var record = event.getSource().getBindingContext().getObject();
			if (record.type === "tag") {
				this._setQueryParameter("search", "tag:" + record.name);
			} else {
				this._getRouter().navTo("record", {
					recordId: record.id
				});
			}
		}

	});

});
