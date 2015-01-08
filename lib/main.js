var { Hotkey } = require("sdk/hotkeys");
var tabs = require("sdk/tabs");
var { Cc, Ci } = require("chrome");
var SearchService = Cc["@mozilla.org/browser/search-service;1"].getService(Ci.nsIBrowserSearchService);

var showHotKey = Hotkey({
  combo: "accel-return",
  onPress: function() {
    openAtNewTab();
  }
});

function openAtNewTab() {
    var _focusedElement = require('sdk/window/utils').getFocusedElement();
    if (_focusedElement) {
        var urlValue = _focusedElement.value;

        // url bar
        if (_focusedElement.className.indexOf("urlbar-input") > -1) {
            var newTab = require("sdk/simple-prefs").prefs.urlbarTarget;
            if ( _isURI(urlValue) ) {
                tabs.open({ url: urlValue, inBackground: !newTab });
            } else if ( _isURI("http://" + urlValue) ) {
                tabs.open({ url: "http://" + urlValue, inBackground: !newTab });
            } else {
                tabs.open({ url: _searchEngine(urlValue,false), inBackground: !newTab });
            }

        // search bar
        } else if (_focusedElement.className.indexOf("textbox-input") > -1) {
            var newTab = require("sdk/simple-prefs").prefs.searchbarTarget;
            tabs.open({ url: _searchEngine(urlValue,true), inBackground: !newTab });
        }
    }
}

function _searchEngine(urlValue, isSearchBar) {
    var spec = '';
    if (isSearchBar && SearchService.currentEngine) {
        spec = SearchService.currentEngine.getSubmission(urlValue).uri.spec;
    } else if (SearchService.defaultEngine) {
        spec = SearchService.defaultEngine.getSubmission(urlValue).uri.spec;
    } else {
        spec = SearchService.originalDefaultEngine.getSubmission(urlValue).uri.spec;
    }
    return spec;
}

function _isURI(str) {
    return /^(https?):\/\/([A-Z\d\.-]{2,})\.([A-Z]{2,})(:\d{2,4})?/i.test(str);
}