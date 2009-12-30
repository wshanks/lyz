// Only create main object once
if (!Zotero.Lyz) {
    const lyzLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
	.getService(Components.interfaces.mozIJSSubScriptLoader);
    lyzLoader.loadSubScript("chrome://lyz/content/lyz.js");
    window.addEventListener('load', function(e) { Zotero.Lyz.init(); }, false);
}
