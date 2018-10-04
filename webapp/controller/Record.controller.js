sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"

], function(BaseController, JSONModel) {
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
					},
					dataReceived: function () {
						recordPage.setBusy(false);
					}
				}
			});
		},

		_onBindingChanged: function () {
			var binding = this.getView().getElementBinding();
			if (!binding.getBoundContext()) {
				alert("problem");
			}
		},

		onBack: function () {
			history.back();
		}

	});

});
