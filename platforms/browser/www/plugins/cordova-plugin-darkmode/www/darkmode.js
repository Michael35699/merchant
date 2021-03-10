cordova.define("cordova-plugin-darkmode.darkmode", function(require, exports, module) { module.exports = {
    isDarkModeEnabled: function (successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "DarkMode", "darkmode", []);
    },
    isInversionEnabled: function (successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "DarkMode", "inversion", []);
    }	
};

});
