sap.ui.define([
	"./BaseController",
	"sap/m/Token",
	"sap/ui/model/json/JSONModel"

], function(BaseController, Token, JSONModel) {
	"use strict";

	return BaseController.extend("bubu-cms.controller.Record", {

		onInit: function () {
			this._getRouter().getRoute("record").attachPatternMatched(this._onDisplayRecord, this);
			this.getView().setModel(new JSONModel({
				options: [{
					value: 0
				}, {
					value: 1
				}, {
					value: 2
				}, {
					value: 3
				}, {
					value: 4
				}, {
					value: 5
				}]
			}), "rating");
			this.getView().setModel(new JSONModel({
				count: 0
			}), "tags");
		},

		_onDisplayRecord: function (event) {
			var recordId = event.getParameter("arguments").recordId,
				sPath = "/" + this.getOwnerComponent().getModel().createKey("RecordSet", {
					id: recordId
				}),
				page = this.byId("page");
			this.getView().bindElement({
				path: sPath,
				events: {
					change: this._onBindingChanged.bind(this),
					dataRequested: function () {
						page.setBusy(true);
					}
				}
			});
		},

		_onBindingChanged: function () {
			var page = this.byId("page"),
				binding = this.getView().getElementBinding(),
				tokens = this.byId("tokens"),
				record;
			if (!binding.getBoundContext()) {
				alert("problem");
			}
			record = binding.getBoundContext().getObject();
			this.getView().getModel("tags").setProperty("/count", record.tags.split(" ").length);
			this.byId("htmlContent").setContent("<p>" + JSON.stringify(record).split(",").join("\n") + "</p>");
			page.setSelectedSection(this.byId("content").getId());
			page.setBusy(false);
		},

		onBack: function () {
			history.back();
		}

	});

});
