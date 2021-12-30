sap.ui.define(
	["sap/ui/core/UIComponent", "sap/ui/Device", "com/infocus/TimeApprovalV2/model/models"],
	function(UIComponent, Device, models) {
		"use strict";

		return UIComponent.extend("com.infocus.TimeApprovalV2.Component", {
			metadata: {
				manifest: "json"
			},

			/**
			 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
			 * @public
			 * @override
			 */
			init: function() {
				// call the base component's init function
				UIComponent.prototype.init.apply(this, arguments);

				// enable routing
				this.getRouter().initialize();

				// set the device model
				//this.setModel(models.createDeviceModel(), "device");
				// set the device model
				var deviceModel = models.createDeviceModel();
				this.setModel(deviceModel, "device");

				var _self = this;

				function sizeChanged(mParams) {
					console.log(mParams.name);
					deviceModel.setProperty("/deviceType",mParams.name);
					switch (mParams.name) {
						case "Phone":
							// Do what is needed for a little screen
							
							//break;
						case "Tablet":
							// Do what is needed for a medium sized screen
							deviceModel.setProperty("/backBtnVisibility", true);
							deviceModel.setProperty("/detailBoxVisibility", false);
							break;
						case "Desktop":
							// Do what is needed for a large screen
							deviceModel.setProperty("/backBtnVisibility", false);
							deviceModel.setProperty("/detailBoxVisibility", true);
					}
					_self.setModel(deviceModel, "device");
					console.log(deviceModel);
				}
				// Register an event handler to changes of the screen size
				sap.ui.Device.media.attachHandler(sizeChanged, null, sap.ui.Device.media.RANGESETS.SAP_STANDARD);
				// Do some initialization work based on the current size
				sizeChanged(sap.ui.Device.media.getCurrentRange(sap.ui.Device.media.RANGESETS.SAP_STANDARD));
			}
		});
	}
);