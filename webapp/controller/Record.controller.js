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
				recordPage = this.byId("recordPage");
			this.getView().bindElement({
				path: sPath,
				events: {
					change: this._onBindingChanged.bind(this),
					dataRequested: function () {
						recordPage.setBusy(true);
					}
				}
			});
		},

		_onBindingChanged: function () {
			var binding = this.getView().getElementBinding(),
				tokens = this.byId("tokens"),
				record;
			if (!binding.getBoundContext()) {
				alert("problem");
			}
			record = binding.getBoundContext().getObject();
			this.getView().getModel("tags").setProperty("/count", record.tags.split(" ").length);
			this.byId("recordPage").setBusy(false);
			this.byId("content").setContent("<p>" + JSON.stringify(record).split(",").join("\n") + "</p>");
		},

		onBack: function () {
			history.back();
		}

	});

});
