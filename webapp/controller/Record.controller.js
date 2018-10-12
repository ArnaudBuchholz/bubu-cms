sap.ui.define([
	"./BaseController",
	"sap/m/Token",
	"sap/ui/model/json/JSONModel"

], function(BaseController, Token, JSONModel) {
	"use strict";

	var URLHelper = sap.m.URLHelper,
		REGEX_PHONENUMBER = /(?:\+?(\d{1,3}))?[- (]*(\d{3})[- )]*(\d{3})[- ]*(\d{4})(?: *x(\d+))?\b/;

	return BaseController.extend("bubu-cms.controller.Record", {

		onInit: function () {
			this._getRouter().getRoute("record").attachPatternMatched(this._onDisplayRecord, this);
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
				record;
			if (!binding.getBoundContext()) {
				alert("problem");
			}
			record = binding.getBoundContext().getObject();
			this.byId("htmlContent").setContent("<p>" + JSON.stringify(record).split(",").join("\n") + "</p>");
			page.setModel(new JSONModel({
				list: record.tags.split(" ").map(function (tag) {
					return {
						editable: tag !== record.type,
						id: tag
					};
				})
			}), "tags");
			page.setSelectedSection(this.byId("content").getId());
			page.setBusy(false);
		},

		onBack: function () {
			history.back();
		},

		onProperties: function () {
			this.byId("page").setSelectedSection(this.byId("properties").getId());
		},

		onPressStatus: function (event) {
			var statusText = event.getSource().getText(),
				phone = REGEX_PHONENUMBER.exec(statusText),
				country;
			if (phone) {
				country = phone[0] || "1";
				URLHelper.triggerTel("+" + country + phone[2] + phone[3] + phone[4]);
				return;
			}
		}

	});

});
