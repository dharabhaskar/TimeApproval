sap.ui.define([
	"com/infocus/TimeApprovalV2/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"../model/formatter",
	"sap/m/MessageBox",
], function(Controller, JSONModel, DateFormat, MessageBox) {
	"use strict";

	return Controller.extend("com.infocus.TimeApprovalV2.controller.MainView", {
		onInit: function() {
			var _self = this;
			_self.data = {};
			_self.getView().setModel(new JSONModel(_self.data), "dataSet");
			_self.dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "EEEE, MMMM d, yyyy"
			});
			//--------------------------------------
			// var empId = "00002085";
			// var cicoSet = "/cicoSet('" + empId + "')";
			//-------------------------------------
			_self.loadData();
		},
		loadData: function() {
			var _self = this;
			var empListRequest = "/EmpListSet"
			var rootModel = _self.getView().getModel();
			var model = _self.getView().getModel("dataSet");

			sap.ui.core.BusyIndicator.show();
			rootModel.read(empListRequest, {
				success: function(response) {
					console.log(response);
					sap.ui.core.BusyIndicator.hide();
					var allValues = response.results;
					allValues.forEach(e => {
						e.RegDate = _self.parseToDateString(e.RegDate);
						e.TimeIn = _self.parseToTimeString(e.TimeIn);
						e.TimeOut = _self.parseToTimeString(e.TimeOut);
						e.Comments = e.EmpComments;
					});
					model.setProperty("/empList", allValues);

					//_self.updateRegularizationList(firstItem.EmpCode);

					var entry = {};
					if (allValues.length > 0) {
						entry = allValues[0];
					}
					if (entry) {
						entry.FullDate = _self.parseToDate(entry.RegDate);
					}
					model.setProperty("/entry", entry);
					_self.updateNotesVisibility(entry);
					_self.updateRegularizationList(entry.EmpCode)

					var oList = _self.byId('idList');
					oList.setSelectedItem(oList.getItems().at(0), true);
				
					console.log(allValues);
				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
				}
			});
		},
		onRefreshPress: function() {
			var aFilters = [];
			var oList = this.byId("idList");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters, "Application");
			this.byId("searchfemp").setValue("");
		},
		onEmpSearch: function(oEvent) {
			var sQuery = oEvent.getSource().getValue();

			// add filter for search
			var aFilters = [];

			//Console.log("Query: " + sQuery);
			var oList = this.byId("idList");
			var oBinding = oList.getBinding("items");

			if (sQuery && sQuery.length > 0) {
				var filter = new sap.ui.model.Filter("Ename", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);

				/*var filter = new sap.ui.model.Filter("RegDate", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);*/

				oBinding.filter(aFilters, "Application");
				/*oBinding.filter(new sap.ui.model.Filter({
					filters: aFilters,
					and: false,
					filterType: "Application"
				}));*/
			} else {
				oBinding.filter(aFilters, "Application");
			}
		},
		onDateSelectionChange: function(oEvent) {
			var _self = this;
			var oList = _self.byId('regList');
			var btn = _self.byId('btnSelectAll');
			var model = _self.getView().getModel("dataSet");
			var oSelectedItems = oList.getSelectedItems().map(item => item.getBindingContext("dataSet").getObject())
				//console.log(oSelectedItems);
			model.setProperty("/selectedRegList", oSelectedItems);

			var regList = _self.getView().getModel("dataSet").getProperty('/regList');

			if (oSelectedItems.length == regList.length) {
				btn.setText("Deselect All");
				btn.setType("Emphasized");
			} else {
				btn.setText("Select All");
				btn.setType("Default");
			}

			var btnAcceptAll = _self.byId('btnAcceptAll');
			var btnRejectAll = _self.byId('btnRejectAll');
			if (oSelectedItems.length > 0) {
				btnAcceptAll.setEnabled(true);
				btnRejectAll.setEnabled(true);
			} else {
				btnAcceptAll.setEnabled(false);
				btnRejectAll.setEnabled(false);
			}

			var currentSelection = oEvent.getParameter("listItem").getBindingContext("dataSet").getObject();
			//console.log(currentSelection);
			model.setProperty("/entry", currentSelection);
			_self.updateNotesVisibility(currentSelection);
		},
		onSelectionChange: function(oEvent) {
			var _self = this;
			var rootModel = _self.getView().getModel();
			var model = _self.getView().getModel("dataSet");
			var oList = oEvent.getSource();
			var sText = oList._oSelectedItem.mProperties.title;

			var oSelectedItem = oEvent.getParameter("listItem");
			var selectedEmpData = oSelectedItem.getBindingContext("dataSet").getObject();

			selectedEmpData.FullDate = _self.parseToDate(selectedEmpData.RegDate);
			model.setProperty("/entry", selectedEmpData);

			_self.updateNotesVisibility(selectedEmpData);
			var empNo = selectedEmpData.EmpCode;
			_self.updateRegularizationList(empNo);
		},
		updateRegularizationList: function(empNo) {
			var _self = this;
			var model = _self.getView().getModel("dataSet");
			var rootModel = _self.getView().getModel();
			var empListRequest = "/EmpRegSet";
			sap.ui.core.BusyIndicator.show();
			rootModel.read(empListRequest, {
				urlParameters: {
					"$filter": "EmpCode eq '" + empNo + "'"
				},
				success: function(response) {
					sap.ui.core.BusyIndicator.hide();
					var allValues = response.results;
					var maxDate=new Date();
					maxDate.setDate(maxDate.getDate()-7);
					//console.log('Max Date: '+maxDate);
					
					allValues.forEach(e => {
						e.RegDate = _self.parseToDateString(e.RegDate);
						e.TimeIn = _self.parseToTimeString(e.TimeIn);
						e.TimeOut = _self.parseToTimeString(e.TimeOut);
						e.Comments = e.EmpComments;
						e.CreationDate = _self.parseToDateString(e.CreationDate);
						e.CreationDate2 = _self.parseToDateObj(e.CreationDate);
						//console.log(e.CreationDate2);
					});
					
					model.setProperty("/regList", allValues.filter(e=>{
						//return true;
						return e.CreationDate2>=maxDate;
					}));
					_self.byId("regList").removeSelections();
				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
				}
			});
		},
		updateNotesVisibility: function(selectedEmpData) {
			var notesIconTab = this.byId("notesTab");
			console.log(selectedEmpData);
			if (selectedEmpData.Comments) {
				if (selectedEmpData.Comments.length > 0) {
					notesIconTab.setVisible(true);
				}
			} else {
				notesIconTab.setVisible(false);
			}
			//notesIconTab.setVisible(!(selectedEmpData.Comments || selectedEmpData.Comments.length == 0));
		},
		onAcceptPess: function() {
			var _self = this;
			var model = _self.getView().getModel("dataSet");
			var name = model.getProperty("/entry/Ename");
			if (!this.approveDialog) {
				this.approveDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Approve Regularization",
					content: [
						/*new Label({
							text: "Do you want to submit this order?",
							labelFor: "submissionNote"
						}),*/
						new sap.m.Text("textbox1", {
							width: "100%",
							text: "Approve the regularization request send by " + name,
						})
					],
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: "Approve",
						enabled: true,
						press: function() {
							_self.handleSaveRegularization('Approve', '');
							this.approveDialog.close();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "Cancel",
						press: function() {
							this.approveDialog.close();
						}.bind(this)
					})
				});
			}
			this.approveDialog.open();
		},
		onRejectPress: function() {
			var _self = this;
			var model = _self.getView().getModel("dataSet");
			var entry = model.getProperty("/entry");
			var name = entry.Ename;
			if (!this.oSubmitDialog) {
				var dlg = this;
				dlg.textarea1 = new sap.m.TextArea("textarea1", {
					width: "100%",
				});
				this.oSubmitDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Reject Regularization",
					content: [
						/*new Label({
							text: "Do you want to submit this order?",
							labelFor: "submissionNote"
						}),*/
						new sap.m.Text("textbox2", {
							width: "100%",
							text: "Reject the regularization request send by " + name,
						}),
						dlg.textarea1
					],
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: "Reject",
						enabled: true,
						press: function() {
							dlg.textarea1.setValueState(sap.ui.core.ValueState.None);
							if (!dlg.textarea1.getValue || dlg.textarea1.getValue().length == 0) {
								dlg.textarea1.setValueState(sap.ui.core.ValueState.Error);
							} else {
								_self.handleSaveRegularization('Reject', dlg.textarea1.getValue());
								this.oSubmitDialog.close();
							}
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "Cancel",
						press: function() {
							this.oSubmitDialog.close();
						}.bind(this)
					})
				});
			}
			this.oSubmitDialog.open();
		},
		handleSaveRegularization: function(status, rejReason) {
			var _self = this;
			var model = _self.getView().getModel("dataSet");
			var entry = model.getProperty("/entry");

			var rootModel = _self.getView().getModel();
			//--------------------------------------
			var empId = model.getProperty("/entry").EmpCode; //"00002085";
			//var cicoSet = "/EmpDummySet(EmpNo='" + empId + "')";
			//var cicoSet = "/cicoSet"
			var cicoSet = "/EmpDummySet";
			//-------------------------------------

			var allData = [];
			var allSelected = model.getProperty('/selectedRegList');
			allSelected.forEach(entry => {
				var data = {
					"EmpNo": entry.EmpCode,
					"RegDate": _self.backToServerDateFormat(entry.RegDate),
					"TimeIn": _self.backToServerTimeFormat(entry.TimeIn),
					"TimeOut": _self.backToServerTimeFormat(entry.TimeOut),
					"Status": status.charAt(0),
					"Approver": entry.ApproverCode,
					"RejReason": rejReason
				};
				allData.push(data);
			});

			var regData = {
				EmpNo: entry.EmpCode,
				ToEmp: {
					results: allData
				}
			};

			console.log("Data to save: ");
			console.log(regData);

			sap.ui.core.BusyIndicator.show();
			rootModel.create(cicoSet, regData, {
				success: function(response) {
					sap.ui.core.BusyIndicator.hide();
					console.log(response);
					_self.loadData();
					var msg = 'Regularisation request has been ' + (status.charAt(0) == 'R' ? 'rejected.' : 'accepted.')
					sap.m.MessageBox.success(msg);
				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
					sap.m.MessageBox.alert('Save failed.');
				}
			});
		},
		onSelectAllPress: function(oEvent) {
			var oList = this.byId('regList');
			var btn = oEvent.getSource();
			var btnAcceptAll = this.byId('btnAcceptAll');
			var btnRejectAll = this.byId('btnRejectAll');

			if (btn.getText() == 'Select All') {
				btn.setText("Deselect All");
				btn.setType("Emphasized")
				oList.selectAll();
				btnAcceptAll.setEnabled(true);
				btnRejectAll.setEnabled(true);
			} else {
				btn.setText("Select All");
				btn.setType("Default")
				oList.removeSelections();
				btnAcceptAll.setEnabled(false);
				btnRejectAll.setEnabled(false);
			}
			console.log(oList)
		},
		parseToTimeString: function(tim) {
			var hours = tim.substring(0, 2);
			var minutes = tim.substring(2, 4);
			return hours + ":" + minutes + ":00";
			return tim;
		},
		parseToDateString: function(tim) {
			var year = tim.substring(0, 4);
			var month = tim.substring(4, 6);
			var day = tim.substring(6, 8);
			return day + "/" + month + "/" + year;
			return tim;
		},
		parseToDate: function(tim) {
			var split = tim.split("/");
			var str = split[2] + "-" + split[1] + "-" + split[0];
			return this.dateFormat.format(new Date(Date.parse(str)));
		},
		parseToDateObj: function(tim) {
			var split = tim.split("/");
			var str = split[2] + "-" + split[1] + "-" + split[0];
			return new Date(Date.parse(str));
		},
		backToServerTimeFormat: function(time) {
			var split = time.split(":");
			//PT10H00M00S
			//return 'PT' + split[0] + 'H' + split[1] + 'M' + split[2] + 'S';
			return split[0] + split[1] + split[2];
		},
		backToServerDateFormat: function(date) {
			var split = date.split("/");
			//return new Date(split[2], split[1]-1, split[0]);
			return split[2] + split[1] + split[0];
		},
	});
});