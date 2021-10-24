sap.ui.define([
	"com/infocus/TimeApprovalV2/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"../model/formatter",
	"sap/m/MessageBox",
], function(Controller, JSONModel, DateFormat, MessageBox) {
	"use strict";

	return Controller.extend("com.infocus.TimeApprovalV2.controller.EmployeesView", {
		onInit:function(){
			console.log('Init called...');
		},
		onButtonPressed:function(){
			console.log('button pressed...')
		}
	});
});