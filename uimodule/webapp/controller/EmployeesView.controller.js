sap.ui.define([
	"com/infocus/TimeApprovalV2/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"../model/formatter",
	"sap/m/MessageBox",
], function(Controller, JSONModel, DateFormat, MessageBox) {
	"use strict";

	return Controller.extend("com.infocus.TimeApprovalV2.controller.AppView", {
		onInit:function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("home");
		}
	});
});