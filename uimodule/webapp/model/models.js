sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/Device"], function (JSONModel, Device) {
    "use strict";

    return {
        createDeviceModel: function () {
            /*var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;*/
            var deviceModel = new sap.ui.model.json.JSONModel({
				isTouch: sap.ui.Device.support.touch,
				isNoTouch: !sap.ui.Device.support.touch,
				isPhone: sap.ui.Device.system.phone,
				isNoPhone: !sap.ui.Device.system.phone,
				listMode: sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
				listItemType: sap.ui.Device.system.phone ? "Active" : "Inactive",
				calWidth: "650px",
				calFlexDirection: "Row",
			});
			deviceModel.setDefaultBindingMode("OneWay");
			//this.setModel(deviceModel, "device");
			return deviceModel;
        }
    };
});