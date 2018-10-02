sap.ui.define([
	"sap/ui/core/mvc/Controller"

], function(Controller) {
	"use strict";

	return Controller.extend("bubu-cms.controller.Record", {

		_getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		onInit: function () {
			this._getRouter().getRoute("record").attachPatternMatched(this._onDisplayRecord, this);
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
		}

	});

});
