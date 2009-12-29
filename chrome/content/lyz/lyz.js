// Credits:
// - the idea, createUI and other small bits were borrowed from 
//   Lytero by Demetrio Girardi, lytero@dementrioatgmail.com
// - mapping table comes form BibTeX.js, part of Zotero


// I only need accented characters to clean the citekeys
var mappingTable = {
    /* Derived accented characters */
    "\u00C0":"\\`{A}", // LATIN CAPITAL LETTER A WITH GRAVE
    "\u00C1":"\\'{A}", // LATIN CAPITAL LETTER A WITH ACUTE
    "\u00C2":"\\^{A}", // LATIN CAPITAL LETTER A WITH CIRCUMFLEX
    "\u00C3":"\\~{A}", // LATIN CAPITAL LETTER A WITH TILDE
    "\u00C4":"\\\"{A}", // LATIN CAPITAL LETTER A WITH DIAERESIS
    "\u00C7":"\\c{C}", // LATIN CAPITAL LETTER C WITH CEDILLA
    "\u00C8":"\\`{E}", // LATIN CAPITAL LETTER E WITH GRAVE
    "\u00C9":"\\'{E}", // LATIN CAPITAL LETTER E WITH ACUTE
    "\u00CA":"\\^{E}", // LATIN CAPITAL LETTER E WITH CIRCUMFLEX
    "\u00CB":"\\\"{E}", // LATIN CAPITAL LETTER E WITH DIAERESIS
    "\u00CC":"\\`{I}", // LATIN CAPITAL LETTER I WITH GRAVE
    "\u00CD":"\\'{I}", // LATIN CAPITAL LETTER I WITH ACUTE
    "\u00CE":"\\^{I}", // LATIN CAPITAL LETTER I WITH CIRCUMFLEX
    "\u00CF":"\\\"{I}", // LATIN CAPITAL LETTER I WITH DIAERESIS
    "\u00D1":"\\~{N}", // LATIN CAPITAL LETTER N WITH TILDE
    "\u00D2":"\\`{O}", // LATIN CAPITAL LETTER O WITH GRAVE
    "\u00D3":"\\'{O}", // LATIN CAPITAL LETTER O WITH ACUTE
    "\u00D4":"\\^{O}", // LATIN CAPITAL LETTER O WITH CIRCUMFLEX
    "\u00D5":"\\~{O}", // LATIN CAPITAL LETTER O WITH TILDE
    "\u00D6":"\\\"{O}", // LATIN CAPITAL LETTER O WITH DIAERESIS
    "\u00D9":"\\`{U}", // LATIN CAPITAL LETTER U WITH GRAVE
    "\u00DA":"\\'{U}", // LATIN CAPITAL LETTER U WITH ACUTE
    "\u00DB":"\\^{U}", // LATIN CAPITAL LETTER U WITH CIRCUMFLEX
    "\u00DC":"\\\"{U}", // LATIN CAPITAL LETTER U WITH DIAERESIS
    "\u00DD":"\\'{Y}", // LATIN CAPITAL LETTER Y WITH ACUTE
    "\u00E0":"\\`{a}", // LATIN SMALL LETTER A WITH GRAVE
    "\u00E1":"\\'{a}", // LATIN SMALL LETTER A WITH ACUTE
    "\u00E2":"\\^{a}", // LATIN SMALL LETTER A WITH CIRCUMFLEX
    "\u00E3":"\\~{a}", // LATIN SMALL LETTER A WITH TILDE
    "\u00E4":"\\\"{a}", // LATIN SMALL LETTER A WITH DIAERESIS
    "\u00E5":"\\r{a}", //'LATIN SMALL LETTER A WITH RING ABOVE'
    "\u00E6":"\\ae",  //LATIN SMALL LETTER AE'
    "\u00E7":"\\c{c}", // LATIN SMALL LETTER C WITH CEDILLA
    "\u00E8":"\\`{e}", // LATIN SMALL LETTER E WITH GRAVE
    "\u00E9":"\\'{e}", // LATIN SMALL LETTER E WITH ACUTE
    "\u00EA":"\\^{e}", // LATIN SMALL LETTER E WITH CIRCUMFLEX
    "\u00EB":"\\\"{e}", // LATIN SMALL LETTER E WITH DIAERESIS
    "\u00EC":"\\`{i}", // LATIN SMALL LETTER I WITH GRAVE
    "\u00ED":"\\'{i}", // LATIN SMALL LETTER I WITH ACUTE
    "\u00EE":"\\^{i}", // LATIN SMALL LETTER I WITH CIRCUMFLEX
    "\u00EF":"\\\"{i}", // LATIN SMALL LETTER I WITH DIAERESIS
    "\u00F1":"\\~{n}", // LATIN SMALL LETTER N WITH TILDE
    "\u00F2":"\\`{o}", // LATIN SMALL LETTER O WITH GRAVE
    "\u00F3":"\\'{o}", // LATIN SMALL LETTER O WITH ACUTE
    "\u00F4":"\\^{o}", // LATIN SMALL LETTER O WITH CIRCUMFLEX
    "\u00F5":"\\~{o}", // LATIN SMALL LETTER O WITH TILDE
    "\u00F6":"\\\"{o}", // LATIN SMALL LETTER O WITH DIAERESIS
    "\u00F9":"\\`{u}", // LATIN SMALL LETTER U WITH GRAVE
    "\u00FA":"\\'{u}", // LATIN SMALL LETTER U WITH ACUTE
    "\u00FB":"\\^{u}", // LATIN SMALL LETTER U WITH CIRCUMFLEX
    "\u00FC":"\\\"{u}", // LATIN SMALL LETTER U WITH DIAERESIS
    "\u00FD":"\\'{y}", // LATIN SMALL LETTER Y WITH ACUTE
    "\u00FF":"\\\"{y}", // LATIN SMALL LETTER Y WITH DIAERESIS
    "\u0100":"\\={A}", // LATIN CAPITAL LETTER A WITH MACRON
    "\u0101":"\\={a}", // LATIN SMALL LETTER A WITH MACRON
    "\u0102":"\\u{A}", // LATIN CAPITAL LETTER A WITH BREVE
    "\u0103":"\\u{a}", // LATIN SMALL LETTER A WITH BREVE
    "\u0104":"\\k{A}", // LATIN CAPITAL LETTER A WITH OGONEK
    "\u0105":"\\k{a}", // LATIN SMALL LETTER A WITH OGONEK
    "\u0106":"\\'{C}", // LATIN CAPITAL LETTER C WITH ACUTE
    "\u0107":"\\'{c}", // LATIN SMALL LETTER C WITH ACUTE
    "\u0108":"\\^{C}", // LATIN CAPITAL LETTER C WITH CIRCUMFLEX
    "\u0109":"\\^{c}", // LATIN SMALL LETTER C WITH CIRCUMFLEX
    "\u010A":"\\.{C}", // LATIN CAPITAL LETTER C WITH DOT ABOVE
    "\u010B":"\\.{c}", // LATIN SMALL LETTER C WITH DOT ABOVE
    "\u010C":"\\v{C}", // LATIN CAPITAL LETTER C WITH CARON
    "\u010D":"\\v{c}", // LATIN SMALL LETTER C WITH CARON
    "\u010E":"\\v{D}", // LATIN CAPITAL LETTER D WITH CARON
    "\u010F":"\\v{d}", // LATIN SMALL LETTER D WITH CARON
    "\u0112":"\\={E}", // LATIN CAPITAL LETTER E WITH MACRON
    "\u0113":"\\={e}", // LATIN SMALL LETTER E WITH MACRON
    "\u0114":"\\u{E}", // LATIN CAPITAL LETTER E WITH BREVE
    "\u0115":"\\u{e}", // LATIN SMALL LETTER E WITH BREVE
    "\u0116":"\\.{E}", // LATIN CAPITAL LETTER E WITH DOT ABOVE
    "\u0117":"\\.{e}", // LATIN SMALL LETTER E WITH DOT ABOVE
    "\u0118":"\\k{E}", // LATIN CAPITAL LETTER E WITH OGONEK
    "\u0119":"\\k{e}", // LATIN SMALL LETTER E WITH OGONEK
    "\u011A":"\\v{E}", // LATIN CAPITAL LETTER E WITH CARON
    "\u011B":"\\v{e}", // LATIN SMALL LETTER E WITH CARON
    "\u011C":"\\^{G}", // LATIN CAPITAL LETTER G WITH CIRCUMFLEX
    "\u011D":"\\^{g}", // LATIN SMALL LETTER G WITH CIRCUMFLEX
    "\u011E":"\\u{G}", // LATIN CAPITAL LETTER G WITH BREVE
    "\u011F":"\\u{g}", // LATIN SMALL LETTER G WITH BREVE
    "\u0120":"\\.{G}", // LATIN CAPITAL LETTER G WITH DOT ABOVE
    "\u0121":"\\.{g}", // LATIN SMALL LETTER G WITH DOT ABOVE
    "\u0122":"\\c{G}", // LATIN CAPITAL LETTER G WITH CEDILLA
    "\u0123":"\\c{g}", // LATIN SMALL LETTER G WITH CEDILLA
    "\u0124":"\\^{H}", // LATIN CAPITAL LETTER H WITH CIRCUMFLEX
    "\u0125":"\\^{h}", // LATIN SMALL LETTER H WITH CIRCUMFLEX
    "\u0128":"\\~{I}", // LATIN CAPITAL LETTER I WITH TILDE
    "\u0129":"\\~{i}", // LATIN SMALL LETTER I WITH TILDE
    "\u012A":"\\={I}", // LATIN CAPITAL LETTER I WITH MACRON
    "\u012B":"\\={i}", // LATIN SMALL LETTER I WITH MACRON
    "\u012C":"\\u{I}", // LATIN CAPITAL LETTER I WITH BREVE
    "\u012D":"\\u{i}", // LATIN SMALL LETTER I WITH BREVE
    "\u012E":"\\k{I}", // LATIN CAPITAL LETTER I WITH OGONEK
    "\u012F":"\\k{i}", // LATIN SMALL LETTER I WITH OGONEK
    "\u0130":"\\.{I}", // LATIN CAPITAL LETTER I WITH DOT ABOVE
    "\u0134":"\\^{J}", // LATIN CAPITAL LETTER J WITH CIRCUMFLEX
    "\u0135":"\\^{j}", // LATIN SMALL LETTER J WITH CIRCUMFLEX
    "\u0136":"\\c{K}", // LATIN CAPITAL LETTER K WITH CEDILLA
    "\u0137":"\\c{k}", // LATIN SMALL LETTER K WITH CEDILLA
    "\u0139":"\\'{L}", // LATIN CAPITAL LETTER L WITH ACUTE
    "\u013A":"\\'{l}", // LATIN SMALL LETTER L WITH ACUTE
    "\u013B":"\\c{L}", // LATIN CAPITAL LETTER L WITH CEDILLA
    "\u013C":"\\c{l}", // LATIN SMALL LETTER L WITH CEDILLA
    "\u013D":"\\v{L}", // LATIN CAPITAL LETTER L WITH CARON
    "\u013E":"\\v{l}", // LATIN SMALL LETTER L WITH CARON
    "\u0141":"\\L{}", //LATIN CAPITAL LETTER L WITH STROKE
    "\u0142":"\\l{}", //LATIN SMALL LETTER L WITH STROKE
    "\u0143":"\\'{N}", // LATIN CAPITAL LETTER N WITH ACUTE
    "\u0144":"\\'{n}", // LATIN SMALL LETTER N WITH ACUTE
    "\u0145":"\\c{N}", // LATIN CAPITAL LETTER N WITH CEDILLA
    "\u0146":"\\c{n}", // LATIN SMALL LETTER N WITH CEDILLA
    "\u0147":"\\v{N}", // LATIN CAPITAL LETTER N WITH CARON
    "\u0148":"\\v{n}", // LATIN SMALL LETTER N WITH CARON
    "\u014C":"\\={O}", // LATIN CAPITAL LETTER O WITH MACRON
    "\u014D":"\\={o}", // LATIN SMALL LETTER O WITH MACRON
    "\u014E":"\\u{O}", // LATIN CAPITAL LETTER O WITH BREVE
    "\u014F":"\\u{o}", // LATIN SMALL LETTER O WITH BREVE
    "\u0150":"\\H{O}", // LATIN CAPITAL LETTER O WITH DOUBLE ACUTE
    "\u0151":"\\H{o}", // LATIN SMALL LETTER O WITH DOUBLE ACUTE
    "\u0154":"\\'{R}", // LATIN CAPITAL LETTER R WITH ACUTE
    "\u0155":"\\'{r}", // LATIN SMALL LETTER R WITH ACUTE
    "\u0156":"\\c{R}", // LATIN CAPITAL LETTER R WITH CEDILLA
    "\u0157":"\\c{r}", // LATIN SMALL LETTER R WITH CEDILLA
    "\u0158":"\\v{R}", // LATIN CAPITAL LETTER R WITH CARON
    "\u0159":"\\v{r}", // LATIN SMALL LETTER R WITH CARON
    "\u015A":"\\'{S}", // LATIN CAPITAL LETTER S WITH ACUTE
    "\u015B":"\\'{s}", // LATIN SMALL LETTER S WITH ACUTE
    "\u015C":"\\^{S}", // LATIN CAPITAL LETTER S WITH CIRCUMFLEX
    "\u015D":"\\^{s}", // LATIN SMALL LETTER S WITH CIRCUMFLEX
    "\u015E":"\\c{S}", // LATIN CAPITAL LETTER S WITH CEDILLA
    "\u015F":"\\c{s}", // LATIN SMALL LETTER S WITH CEDILLA
    "\u0160":"\\v{S}", // LATIN CAPITAL LETTER S WITH CARON
    "\u0161":"\\v{s}", // LATIN SMALL LETTER S WITH CARON
    "\u0162":"\\c{T}", // LATIN CAPITAL LETTER T WITH CEDILLA
    "\u0163":"\\c{t}", // LATIN SMALL LETTER T WITH CEDILLA
    "\u0164":"\\v{T}", // LATIN CAPITAL LETTER T WITH CARON
    "\u0165":"\\v{t}", // LATIN SMALL LETTER T WITH CARON
    "\u0168":"\\~{U}", // LATIN CAPITAL LETTER U WITH TILDE
    "\u0169":"\\~{u}", // LATIN SMALL LETTER U WITH TILDE
    "\u016A":"\\={U}", // LATIN CAPITAL LETTER U WITH MACRON
    "\u016B":"\\={u}", // LATIN SMALL LETTER U WITH MACRON
    "\u016C":"\\u{U}", // LATIN CAPITAL LETTER U WITH BREVE
    "\u016D":"\\u{u}", // LATIN SMALL LETTER U WITH BREVE
    "\u0170":"\\H{U}", // LATIN CAPITAL LETTER U WITH DOUBLE ACUTE
    "\u0171":"\\H{u}", // LATIN SMALL LETTER U WITH DOUBLE ACUTE
    "\u0172":"\\k{U}", // LATIN CAPITAL LETTER U WITH OGONEK
    "\u0173":"\\k{u}", // LATIN SMALL LETTER U WITH OGONEK
    "\u0174":"\\^{W}", // LATIN CAPITAL LETTER W WITH CIRCUMFLEX
    "\u0175":"\\^{w}", // LATIN SMALL LETTER W WITH CIRCUMFLEX
    "\u0176":"\\^{Y}", // LATIN CAPITAL LETTER Y WITH CIRCUMFLEX
    "\u0177":"\\^{y}", // LATIN SMALL LETTER Y WITH CIRCUMFLEX
    "\u0178":"\\\"{Y}", // LATIN CAPITAL LETTER Y WITH DIAERESIS
    "\u0179":"\\'{Z}", // LATIN CAPITAL LETTER Z WITH ACUTE
    "\u017A":"\\'{z}", // LATIN SMALL LETTER Z WITH ACUTE
    "\u017B":"\\.{Z}", // LATIN CAPITAL LETTER Z WITH DOT ABOVE
    "\u017C":"\\.{z}", // LATIN SMALL LETTER Z WITH DOT ABOVE
    "\u017D":"\\v{Z}", // LATIN CAPITAL LETTER Z WITH CARON
    "\u017E":"\\v{z}", // LATIN SMALL LETTER Z WITH CARON
    "\u01CD":"\\v{A}", // LATIN CAPITAL LETTER A WITH CARON
    "\u01CE":"\\v{a}", // LATIN SMALL LETTER A WITH CARON
    "\u01CF":"\\v{I}", // LATIN CAPITAL LETTER I WITH CARON
    "\u01D0":"\\v{i}", // LATIN SMALL LETTER I WITH CARON
    "\u01D1":"\\v{O}", // LATIN CAPITAL LETTER O WITH CARON
    "\u01D2":"\\v{o}", // LATIN SMALL LETTER O WITH CARON
    "\u01D3":"\\v{U}", // LATIN CAPITAL LETTER U WITH CARON
    "\u01D4":"\\v{u}", // LATIN SMALL LETTER U WITH CARON
    "\u01E6":"\\v{G}", // LATIN CAPITAL LETTER G WITH CARON
    "\u01E7":"\\v{g}", // LATIN SMALL LETTER G WITH CARON
    "\u01E8":"\\v{K}", // LATIN CAPITAL LETTER K WITH CARON
    "\u01E9":"\\v{k}", // LATIN SMALL LETTER K WITH CARON
    "\u01EA":"\\k{O}", // LATIN CAPITAL LETTER O WITH OGONEK
    "\u01EB":"\\k{o}", // LATIN SMALL LETTER O WITH OGONEK
    "\u01F0":"\\v{j}", // LATIN SMALL LETTER J WITH CARON
    "\u01F4":"\\'{G}", // LATIN CAPITAL LETTER G WITH ACUTE
    "\u01F5":"\\'{g}", // LATIN SMALL LETTER G WITH ACUTE
    "\u1E02":"\\.{B}", // LATIN CAPITAL LETTER B WITH DOT ABOVE
    "\u1E03":"\\.{b}", // LATIN SMALL LETTER B WITH DOT ABOVE
    "\u1E04":"\\d{B}", // LATIN CAPITAL LETTER B WITH DOT BELOW
    "\u1E05":"\\d{b}", // LATIN SMALL LETTER B WITH DOT BELOW
    "\u1E06":"\\b{B}", // LATIN CAPITAL LETTER B WITH LINE BELOW
    "\u1E07":"\\b{b}", // LATIN SMALL LETTER B WITH LINE BELOW
    "\u1E0A":"\\.{D}", // LATIN CAPITAL LETTER D WITH DOT ABOVE
    "\u1E0B":"\\.{d}", // LATIN SMALL LETTER D WITH DOT ABOVE
    "\u1E0C":"\\d{D}", // LATIN CAPITAL LETTER D WITH DOT BELOW
    "\u1E0D":"\\d{d}", // LATIN SMALL LETTER D WITH DOT BELOW
    "\u1E0E":"\\b{D}", // LATIN CAPITAL LETTER D WITH LINE BELOW
    "\u1E0F":"\\b{d}", // LATIN SMALL LETTER D WITH LINE BELOW
    "\u1E10":"\\c{D}", // LATIN CAPITAL LETTER D WITH CEDILLA
    "\u1E11":"\\c{d}", // LATIN SMALL LETTER D WITH CEDILLA
    "\u1E1E":"\\.{F}", // LATIN CAPITAL LETTER F WITH DOT ABOVE
    "\u1E1F":"\\.{f}", // LATIN SMALL LETTER F WITH DOT ABOVE
    "\u1E20":"\\={G}", // LATIN CAPITAL LETTER G WITH MACRON
    "\u1E21":"\\={g}", // LATIN SMALL LETTER G WITH MACRON
    "\u1E22":"\\.{H}", // LATIN CAPITAL LETTER H WITH DOT ABOVE
    "\u1E23":"\\.{h}", // LATIN SMALL LETTER H WITH DOT ABOVE
    "\u1E24":"\\d{H}", // LATIN CAPITAL LETTER H WITH DOT BELOW
    "\u1E25":"\\d{h}", // LATIN SMALL LETTER H WITH DOT BELOW
    "\u1E26":"\\\"{H}", // LATIN CAPITAL LETTER H WITH DIAERESIS
    "\u1E27":"\\\"{h}", // LATIN SMALL LETTER H WITH DIAERESIS
    "\u1E28":"\\c{H}", // LATIN CAPITAL LETTER H WITH CEDILLA
    "\u1E29":"\\c{h}", // LATIN SMALL LETTER H WITH CEDILLA
    "\u1E30":"\\'{K}", // LATIN CAPITAL LETTER K WITH ACUTE
    "\u1E31":"\\'{k}", // LATIN SMALL LETTER K WITH ACUTE
    "\u1E32":"\\d{K}", // LATIN CAPITAL LETTER K WITH DOT BELOW
    "\u1E33":"\\d{k}", // LATIN SMALL LETTER K WITH DOT BELOW
    "\u1E34":"\\b{K}", // LATIN CAPITAL LETTER K WITH LINE BELOW
    "\u1E35":"\\b{k}", // LATIN SMALL LETTER K WITH LINE BELOW
    "\u1E36":"\\d{L}", // LATIN CAPITAL LETTER L WITH DOT BELOW
    "\u1E37":"\\d{l}", // LATIN SMALL LETTER L WITH DOT BELOW
    "\u1E3A":"\\b{L}", // LATIN CAPITAL LETTER L WITH LINE BELOW
    "\u1E3B":"\\b{l}", // LATIN SMALL LETTER L WITH LINE BELOW
    "\u1E3E":"\\'{M}", // LATIN CAPITAL LETTER M WITH ACUTE
    "\u1E3F":"\\'{m}", // LATIN SMALL LETTER M WITH ACUTE
    "\u1E40":"\\.{M}", // LATIN CAPITAL LETTER M WITH DOT ABOVE
    "\u1E41":"\\.{m}", // LATIN SMALL LETTER M WITH DOT ABOVE
    "\u1E42":"\\d{M}", // LATIN CAPITAL LETTER M WITH DOT BELOW
    "\u1E43":"\\d{m}", // LATIN SMALL LETTER M WITH DOT BELOW
    "\u1E44":"\\.{N}", // LATIN CAPITAL LETTER N WITH DOT ABOVE
    "\u1E45":"\\.{n}", // LATIN SMALL LETTER N WITH DOT ABOVE
    "\u1E46":"\\d{N}", // LATIN CAPITAL LETTER N WITH DOT BELOW
    "\u1E47":"\\d{n}", // LATIN SMALL LETTER N WITH DOT BELOW
    "\u1E48":"\\b{N}", // LATIN CAPITAL LETTER N WITH LINE BELOW
    "\u1E49":"\\b{n}", // LATIN SMALL LETTER N WITH LINE BELOW
    "\u1E54":"\\'{P}", // LATIN CAPITAL LETTER P WITH ACUTE
    "\u1E55":"\\'{p}", // LATIN SMALL LETTER P WITH ACUTE
    "\u1E56":"\\.{P}", // LATIN CAPITAL LETTER P WITH DOT ABOVE
    "\u1E57":"\\.{p}", // LATIN SMALL LETTER P WITH DOT ABOVE
    "\u1E58":"\\.{R}", // LATIN CAPITAL LETTER R WITH DOT ABOVE
    "\u1E59":"\\.{r}", // LATIN SMALL LETTER R WITH DOT ABOVE
    "\u1E5A":"\\d{R}", // LATIN CAPITAL LETTER R WITH DOT BELOW
    "\u1E5B":"\\d{r}", // LATIN SMALL LETTER R WITH DOT BELOW
    "\u1E5E":"\\b{R}", // LATIN CAPITAL LETTER R WITH LINE BELOW
    "\u1E5F":"\\b{r}", // LATIN SMALL LETTER R WITH LINE BELOW
    "\u1E60":"\\.{S}", // LATIN CAPITAL LETTER S WITH DOT ABOVE
    "\u1E61":"\\.{s}", // LATIN SMALL LETTER S WITH DOT ABOVE
    "\u1E62":"\\d{S}", // LATIN CAPITAL LETTER S WITH DOT BELOW
    "\u1E63":"\\d{s}", // LATIN SMALL LETTER S WITH DOT BELOW
    "\u1E6A":"\\.{T}", // LATIN CAPITAL LETTER T WITH DOT ABOVE
    "\u1E6B":"\\.{t}", // LATIN SMALL LETTER T WITH DOT ABOVE
    "\u1E6C":"\\d{T}", // LATIN CAPITAL LETTER T WITH DOT BELOW
    "\u1E6D":"\\d{t}", // LATIN SMALL LETTER T WITH DOT BELOW
    "\u1E6E":"\\b{T}", // LATIN CAPITAL LETTER T WITH LINE BELOW
    "\u1E6F":"\\b{t}", // LATIN SMALL LETTER T WITH LINE BELOW
    "\u1E7C":"\\~{V}", // LATIN CAPITAL LETTER V WITH TILDE
    "\u1E7D":"\\~{v}", // LATIN SMALL LETTER V WITH TILDE
    "\u1E7E":"\\d{V}", // LATIN CAPITAL LETTER V WITH DOT BELOW
    "\u1E7F":"\\d{v}", // LATIN SMALL LETTER V WITH DOT BELOW
    "\u1E80":"\\`{W}", // LATIN CAPITAL LETTER W WITH GRAVE
    "\u1E81":"\\`{w}", // LATIN SMALL LETTER W WITH GRAVE
    "\u1E82":"\\'{W}", // LATIN CAPITAL LETTER W WITH ACUTE
    "\u1E83":"\\'{w}", // LATIN SMALL LETTER W WITH ACUTE
    "\u1E84":"\\\"{W}", // LATIN CAPITAL LETTER W WITH DIAERESIS
    "\u1E85":"\\\"{w}", // LATIN SMALL LETTER W WITH DIAERESIS
    "\u1E86":"\\.{W}", // LATIN CAPITAL LETTER W WITH DOT ABOVE
    "\u1E87":"\\.{w}", // LATIN SMALL LETTER W WITH DOT ABOVE
    "\u1E88":"\\d{W}", // LATIN CAPITAL LETTER W WITH DOT BELOW
    "\u1E89":"\\d{w}", // LATIN SMALL LETTER W WITH DOT BELOW
    "\u1E8A":"\\.{X}", // LATIN CAPITAL LETTER X WITH DOT ABOVE
    "\u1E8B":"\\.{x}", // LATIN SMALL LETTER X WITH DOT ABOVE
    "\u1E8C":"\\\"{X}", // LATIN CAPITAL LETTER X WITH DIAERESIS
    "\u1E8D":"\\\"{x}", // LATIN SMALL LETTER X WITH DIAERESIS
    "\u1E8E":"\\.{Y}", // LATIN CAPITAL LETTER Y WITH DOT ABOVE
    "\u1E8F":"\\.{y}", // LATIN SMALL LETTER Y WITH DOT ABOVE
    "\u1E90":"\\^{Z}", // LATIN CAPITAL LETTER Z WITH CIRCUMFLEX
    "\u1E91":"\\^{z}", // LATIN SMALL LETTER Z WITH CIRCUMFLEX
    "\u1E92":"\\d{Z}", // LATIN CAPITAL LETTER Z WITH DOT BELOW
    "\u1E93":"\\d{z}", // LATIN SMALL LETTER Z WITH DOT BELOW
    "\u1E94":"\\b{Z}", // LATIN CAPITAL LETTER Z WITH LINE BELOW
    "\u1E95":"\\b{z}", // LATIN SMALL LETTER Z WITH LINE BELOW
    "\u1E96":"\\b{h}", // LATIN SMALL LETTER H WITH LINE BELOW
    "\u1E97":"\\\"{t}", // LATIN SMALL LETTER T WITH DIAERESIS
    "\u1EA0":"\\d{A}", // LATIN CAPITAL LETTER A WITH DOT BELOW
    "\u1EA1":"\\d{a}", // LATIN SMALL LETTER A WITH DOT BELOW
    "\u1EB8":"\\d{E}", // LATIN CAPITAL LETTER E WITH DOT BELOW
    "\u1EB9":"\\d{e}", // LATIN SMALL LETTER E WITH DOT BELOW
    "\u1EBC":"\\~{E}", // LATIN CAPITAL LETTER E WITH TILDE
    "\u1EBD":"\\~{e}", // LATIN SMALL LETTER E WITH TILDE
    "\u1ECA":"\\d{I}", // LATIN CAPITAL LETTER I WITH DOT BELOW
    "\u1ECB":"\\d{i}", // LATIN SMALL LETTER I WITH DOT BELOW
    "\u1ECC":"\\d{O}", // LATIN CAPITAL LETTER O WITH DOT BELOW
    "\u1ECD":"\\d{o}", // LATIN SMALL LETTER O WITH DOT BELOW
    "\u1EE4":"\\d{U}", // LATIN CAPITAL LETTER U WITH DOT BELOW
    "\u1EE5":"\\d{u}", // LATIN SMALL LETTER U WITH DOT BELOW
    "\u1EF2":"\\`{Y}", // LATIN CAPITAL LETTER Y WITH GRAVE
    "\u1EF3":"\\`{y}", // LATIN SMALL LETTER Y WITH GRAVE
    "\u1EF4":"\\d{Y}", // LATIN CAPITAL LETTER Y WITH DOT BELOW
    "\u1EF5":"\\d{y}", // LATIN SMALL LETTER Y WITH DOT BELOW
    "\u1EF8":"\\~{Y}", // LATIN CAPITAL LETTER Y WITH TILDE
    "\u1EF9":"\\~{y}" // LATIN SMALL LETTER Y WITH TILDE

}
Zotero.Lyz = {
    
    prefs: null,
    DB: null,
    
    createUI: function() {
	var parentn = document.getElementById("zotero-items-pane").firstChild;
	var lyzb = document.createElement("toolbarbutton");
	lyzb.setAttribute("id", "lyz-menu-button");
	var siblingn = document.getElementById("zotero-tb-advanced-search");
	parentn.insertBefore(lyzb, siblingn);
	parentn.insertBefore(document.createElement("toolbarseparator"),siblingn);	
	document.loadOverlay("chrome://lyz/content/lyz-menu.xul", null);
    },
    
    init: function () {
	this.DB = new Zotero.DBConnection("lyz");
	if (!this.DB.tableExists('docs')) {
	    sql = "CREATE TABLE docs (id INTEGER PRIMARY KEY, doc TEXT, bib TEXT)"
	    this.DB.query(sql);
	    sql = "CREATE TABLE keys (id INTEGER PRIMARY KEY, key TEXT, bib TEXT, zid INT)"
	    this.DB.query(sql);
	}
	
	//set up preferences
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"].
	    getService(Components.interfaces.nsIPrefService);
	this.prefs = this.prefs.getBranch("extensions.lyz.");	
	this.createUI();	

    },
    
    lyxGetDoc: function(){
	res = this.lyxPipeWrite("server-get-filename");
	if(!res) {
	    alert("Could not contact server at: "+this.prefs.getCharPref("lyxserver"));
	    return;
	}
	
	response = this.lyxPipeRead();
	fre = /.*server-get-filename:(.*)\n$/;
	filename = fre.exec(response);
	if (filename==null) {alert("ERROR: lyxGetDoc: "+response);}
	
	return filename[1];
    },
    
    lyxPipeRead: function(){
	// reading from lyxpipe.out
	var pipeout = Components.classes["@mozilla.org/file/local;1"]
	    .createInstance(Components.interfaces.nsILocalFile);
	path = this.prefs.getCharPref("lyxserver");
	pipeout.initWithPath(path+".out");
	if(!pipeout.exists()){
	    alert("The specified LyXServer pipe does not exist.");
	    return;
	}
	var pipeout_stream = Components.classes["@mozilla.org/network/file-input-stream;1"].
            createInstance(Components.interfaces.nsIFileInputStream);
	var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
	    createInstance(Components.interfaces.nsIConverterInputStream);
	pipeout_stream.init(pipeout, -1, 0, 0);
	cstream.init(pipeout_stream, "UTF-8", 0, 0);
	var data = "";
	var str = {};
	cstream.readString(-1, str); // read the whole file and put it in str.value
	data = str.value;
	cstream.close();
	return data;
    },
    
    lyxPipeWrite: function(command){
	// writing to lyxpipe.in
	var pipein = Components.classes["@mozilla.org/file/local;1"]
	    .createInstance(Components.interfaces.nsILocalFile);
	pipein.initWithPath(this.prefs.getCharPref("lyxserver")+".in");
	if(!pipein.exists()){
	    alert("Wrong path to Lyx server.\nSet the path specified in Lyx preferences.");
	    return;
	}
	var pipein_stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
	    .createInstance(Components.interfaces.nsIFileOutputStream);
	pipein_stream.init(pipein, 0x02| 0x10, 0666, 0); // write, append
	
	var msg = "LYXCMD:lyz:"+command+"\n";
	pipein_stream.write(msg, msg.length);
	pipein_stream.close();
	return true;
    },
    
    settings: function (){ 
    	var params = {inn:{citekey:this.prefs.getCharPref("citekey"),
    			   lyxserver:this.prefs.getCharPref("lyxserver")},
    		      out:null};       
    	window.openDialog("chrome://lyz/content/settings.xul", "",
    			  "chrome, dialog, modal, centerscreen, resizable=yes", params);
	
    	if (params.out) {
    	    // User clicked ok. Process changed arguments; e.g. write them to disk or whatever
    	    this.prefs.setCharPref("citekey",params.out.citekey);
    	    this.prefs.setCharPref("lyxserver",params.out.lyxserver);
    	}	
    },
    
    addNewDocument: function(doc,bib) {
	// if the doc can be only associated with one bibtex file
	this.DB.query("INSERT INTO docs (doc,bib) VALUES(\""+doc+"\",\""+bib+"\")");
    },


    checkDocInDB: function(){
	doc = this.lyxGetDoc();
	if (!doc) return;
	res = this.DB.query("SELECT bib FROM docs WHERE doc=\""+doc+"\"");
	if (!res) return [res,doc];
	return [res[0]['bib'],doc];
    },
    
    checkAndCite: function(){
	// check document name
	var res = this.checkDocInDB();
	if(!res) {alert("checkAndCite"); return;}
	var doc = res[1];
	var bib = res[0];
	var bib_file;

	if (!bib) {
	    t = "Press OK to create new BibTeX database.\n";
	    t+= "Press NO to select from your existing databases";
	    var res = confirm(t);
	    if(res){
		bib_file = this.dialog_FilePickerSave("Select Bibtex file for "+doc,"Bibtex", "*.bib");
	    } else {
		bib_file = this.dialog_FilePickerOpen("Select Bibtex file for "+doc,"Bibtex", "*.bib");
	    }

	    bib = bib_file.path;
	    if (bib_file) this.addNewDocument(doc,bib);
	    else return;
	}
	// export citation to Bibtex
	var zitems = ZoteroPane.getSelectedItems();
	// FIXME: this should be called bellow, but it returns empty there (???)
	if(!zitems.length){
	    alert("Please select at least one citation.");
	    return;
	}
	items = this.exportToBibtex(zitems);
	for (var id in items){
	    text = items[id].toString();
	    var entries_text = "";
	    var keys = new Array();
	
	    tmp = this.createCiteKey(text);
	    key = tmp[0];
	    keys.push(key);
	    //check database, if not in, append to entries_text
	    //single key can be associated with several bibtex files
	    zid = this.DB.query("SELECT zid FROM keys WHERE key=\""+key+"\" AND bib=\""+bib+"\"");
	    if(!zid){
		this.DB.query("INSERT INTO keys VALUES(null,\""+key+"\",\""+bib+"\","+id+")");
		entries_text+=tmp[1]+"\n";
	    } else {
		// the rare case when author published the same title twice in the same year
		// this is also happen when citation copy of an entry, but that's OK.
		// append the Zotero ID, which is unique, to the new key, so it can be recognized later
		// thus try if there is also key_zid first
		zid = this.DB.query("SELECT zid FROM keys WHERE key=\""+key+"_"
				    +zid.toString()+"\" AND bib=\""+bib+"\"");
		if(!zid){// key_zid not found, this may be just unique reference!
		    
		    // this could be the same reference, just modified!
		    // if modified, just get all references for the bibtex file and export all
		    
		    //is this the best way to check the identity?
		    if (olditem_biblio == biblio.text){
			
		    } else {
			var res = prompt("Cite key "+key+" already exists!\nPlease edit the key.\n"+
					 "Old reference:\n"+olditem_biblio.text+"\n\nNew reference:\n"+
					 biblio.text,key);
			if (!res) return;
		    }
		    
		    this.DB.query("INSERT INTO keys VALUES(null,\""+key+"\",\""+bib+"\","+id+")");
		    entries_text+=tmp[1]+"\n";
		}
	    }
	}	
	if (!entries_text=="") this.updateBibtex(bib,entries_text);
	this.lyxPipeWrite("citation-insert:"+keys.join(","));
    },
    
    createCiteKey: function(text){
	//TODO: allow user to manually change the key
	var dic = new Array();
	var ckre = /.*@[a-z]+\{([^,]+),{1}/;
	var oldkey = ckre.exec(text)[1];
	
	// NAME
	ckre = /author\s?=\s?\{(.*)\},?\n/;
	var creators = ckre.exec(text);
	if (!creators){
	    ckre = /editor\s?=\s?\{(.*)\},?\n/;
	    creators = ckre.exec(text);
	}
	var authors = creators[1];
	if (authors.split(" and ").length>1){
	    author = authors.split(" and ")[0].split(" ");
	    author = author[author.length-1].toLowerCase();
	} else {
	    author = authors.split(" ");
	    author = author[author.length-1].toLowerCase();
	}	
	// replace accented characters
	ckre = /\{([a-zA-Z]{1})\}/;
	var chars = author.split("");
	var c = "";
	author = "";
	for (var i=0;i<chars.length;i++){
	    if (chars[i] in mappingTable){
		c = mappingTable[chars[i]];
		c = ckre.exec(c)[1];
	    }
	    else c = chars[i];
	    author+=c;
	}
	dic["author"] = author;
	
	// TITLE
	ckre = /title = \{(.*)\},\n/;
	
	var t = ckre.exec(text)[1].toLowerCase();
	t = t.replace(/[^a-z0-9\s]/g,"");
	t = t.split(" ");
	t.reverse();
	var title = t.pop();
	if (title<6){// the, a, on, about
	    title += t.pop();
	}
	if (title.length<7){
	    title+=t.pop();
	}
	// title's can contain commas, collons, e.g. "Godel, Escher, Bach: An Eternal Golden Braid",
	// which have to be removed. This is lame, FIXME: remove all non [a-zA-Z0-9].
	title = title.replace(",","");
	title = title.replace(":","");
	dic["title"] = title;
	// YEAR
	ckre = /.*year\s?=\s?\{(.*)\},?/;
	year = ckre.exec(text)[1].replace(" ","");
	dic["year"] = year;
	// custom cite key
	p = this.prefs.getCharPref("citekey").split(" ");
	citekey = "";
	for (var i=0;i<p.length;i++){
	    if (p[i] in dic) {citekey+=dic[p[i]];}
	    else citekey+=p[i];
	}
	citekey = citekey.replace("{","");
	citekey = citekey.replace("}","");
	text = text.replace(oldkey,citekey);
	return [citekey,text];
    },
    

    exportToBibliography: function(item){
	var format = "bibliography=http://www.zotero.org/styles/chicago-author-date";
	var biblio = Zotero.QuickCopy.getContentFromItems([item],format);
	return biblio.text;
    }
    
    exportToBibtex: function (items){
	var text;
	var callback = function(obj, worked) {
	    text = obj.output.replace(/\r\n/g, "\n");
	};
	var translation = new Zotero.Translate("export");
	translation.setTranslator('9cb70025-a888-4a29-a210-93ec52da40d4');
	translation.setHandler("done", callback);
	    
	var tmp = new Array();
	for (var i=0;i<items.length;i++){
	    var id = items[i].id;
	    translation.setItems(items);
	    translation.translate();
	    tmp[id] = text;
	}
	return tmp;
    },

    updateBibtex: function(bib,entries_text) {
	// write to bibtex file
	var fbibtex = Components.classes["@mozilla.org/file/local;1"]
	    .createInstance(Components.interfaces.nsILocalFile);
	fbibtex.initWithPath(bib);
	if(!fbibtex.exists()){
	    //FIXME: load file selection dialog
	    alert("File "+bib+" does not exist!\nSomething went wrong.");
	    return;
	}
	var fbibtex_stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
	    .createInstance(Components.interfaces.nsIFileOutputStream);
	fbibtex_stream.init(fbibtex, 0x02| 0x10, 0666, 0); // write, append

	var cstream = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
	    .createInstance(Components.interfaces.nsIConverterOutputStream);
	cstream.init(fbibtex_stream, "UTF-8", 0, 0);	
	cstream.writeString(entries_text);
	cstream.close();
    },
    
    updateBibtexAll: function(){
	alert("Sorry, not implemented yet.");
    },
    
    dialog_FilePickerOpen: function(title,filter_title,filter){
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, title, nsIFilePicker.modeOpen);
	fp.appendFilter(filter_title,filter);
	var res = fp.show();
	if (res == nsIFilePicker.returnOK){
	    return fp.file;
	}
    },

    dialog_FilePickerSave: function(title,filter_title,filter){
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, title, nsIFilePicker.modeSave);
	fp.appendFilter(filter_title,filter);
	var res = fp.show();
	if (res == nsIFilePicker.returnOK || res == nsIFilePicker.returnReplace){
	    // add default extension, guess there must be other way to do it
	    // but this is what came to my mind first
	    if (fp.file.path.split(".").length<2){
		// this is weird, but I don't know how to set new path
		var file = Components.classes["@mozilla.org/file/local;1"]
		    .createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(fp.file.path+".bib");
		file.create(file.NORMAL_FILE_TYPE,0666);
		return file;
	    } else if(!fp.file.exists()){
		fp.file.create(file.NORMAL_FILE_TYPE,0666);
		return fp.file;
	    } else {return fp.file;}
	}
    }
}

window.addEventListener('load', function(e) { Zotero.Lyz.init(); }, false);
