// Credits:
// - the idea, createUI and other small bits were borrowed from 
//   Lytero by Demetrio Girardi, lytero@dementrioatgmail.com
// - mapping table comes form BibTeX.js, part of Zotero

// TODO:
// storing the keys in database is not necessary anymore as they are 
// present in the bibtex file. But db is probably more convenient.

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
    replace: false,
    wm: null,
    
    init: function () {
	this.DB = new Zotero.DBConnection("lyz");
	var sql;
	if (!this.DB.tableExists('docs')) {
	    sql = "CREATE TABLE docs (id INTEGER PRIMARY KEY, doc TEXT, bib TEXT)"
	    this.DB.query(sql);
	    sql = "CREATE TABLE keys (id INTEGER PRIMARY KEY, key TEXT, bib TEXT, zid TEXT)"
	    this.DB.query(sql);
	} 
	//set up preferences
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"].
	    getService(Components.interfaces.nsIPrefService);
	this.prefs = this.prefs.getBranch("extensions.lyz.");	
	
	this.wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
    },
    
    lyxGetDoc: function(){
	var res;
	var fre;
	var fname
	var win = this.wm.getMostRecentWindow("navigator:browser"); 
	res = this.lyxPipeWrite("server-get-filename");
	if(!res) {
	    win.alert("Could not contact server at: "+this.prefs.getCharPref("lyxserver"));
	    return;
	}
	
	res = this.lyxPipeRead();
	fre = /.*server-get-filename:(.*)\n$/;
	fname = fre.exec(res);
	if (fname==null) {win.alert("ERROR: lyxGetDoc: "+res);}
	return fname[1];
    },
    
    lyxPipeRead: function(){
	// reading from lyxpipe.out
	var pipeout;
	var path;
	var pipeout_stream;
	var cstream;
	var data;
	var str;
	var win = this.wm.getMostRecentWindow("navigator:browser"); 

	pipeout = Components.classes["@mozilla.org/file/local;1"]
	    .createInstance(Components.interfaces.nsILocalFile);
	path = this.prefs.getCharPref("lyxserver");
	pipeout.initWithPath(path+".out");
	if(!pipeout.exists()){
	    win.alert("The specified LyXServer pipe does not exist.");
	    return;
	}
	pipeout_stream = Components.classes["@mozilla.org/network/file-input-stream;1"].
            createInstance(Components.interfaces.nsIFileInputStream);
	cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
	    createInstance(Components.interfaces.nsIConverterInputStream);
	pipeout_stream.init(pipeout, -1, 0, 0);
	cstream.init(pipeout_stream, "UTF-8", 0, 0);
	data = "";
	str = {};
	cstream.readString(-1, str); // read the whole file and put it in str.value
	data = str.value;
	cstream.close();
	return data;
    },
    
    lyxPipeWrite: function(command){
	// writing to lyxpipe.in
	var pipein;
	var pipein_stream;
	var msg;
	var win = this.wm.getMostRecentWindow("navigator:browser"); 

	pipein = Components.classes["@mozilla.org/file/local;1"]
	    .createInstance(Components.interfaces.nsILocalFile);
	pipein.initWithPath(this.prefs.getCharPref("lyxserver")+".in");
	if(!pipein.exists()){
	    win.alert("Wrong path to Lyx server.\nSet the path specified in Lyx preferences.");
	    return;
	}
	pipein_stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
	    .createInstance(Components.interfaces.nsIFileOutputStream);
	pipein_stream.init(pipein, 0x02| 0x10, 0666, 0); // write, append
	
	msg = "LYXCMD:lyz:"+command+"\n";
	pipein_stream.write(msg, msg.length);
	pipein_stream.close();
	return true;
    },
    
    settings: function (){ 
	var params;
	var inn;
	var out;
	var win = this.wm.getMostRecentWindow("navigator:browser"); 

    	var params = {inn:{citekey:this.prefs.getCharPref("citekey"),
    			   lyxserver:this.prefs.getCharPref("lyxserver")},
    		      out:null};       
    	win.openDialog("chrome://lyz/content/settings.xul", "",
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
	var doc;
	var res;	
	var win = this.wm.getMostRecentWindow("navigator:browser"); 
	doc = this.lyxGetDoc();
	if (!doc) {win.alert("Could not retrieve document name."); return;}

	res = this.DB.query("SELECT doc,bib FROM docs WHERE doc=\""+doc+"\"");
	if (!res) return [res,doc];
	return [res[0]['bib'],res[0]['doc']];
    },
    
    checkAndCite: function(){
	// export citation to Bibtex
	var win = this.wm.getMostRecentWindow("navigator:browser"); 
	var zitems = win.ZoteroPane.getSelectedItems();
	// FIXME: this should be called bellow, but it returns empty there (???)
	if(!zitems.length){
	    win.alert("Please select at least one citation.");
	    return;
	}

	// check document name
	var res = this.checkDocInDB();
	var doc = res[1];
	var bib = res[0];
	var bib_file;
	var items;
	var keys;
	var entries_text = "";
	var citekey;
	var text;

	if (!bib) {
	    t = "Press OK to create new BibTeX database.\n";
	    t+= "Press Cancel to select from your existing databases";
	    // FIXME: the buttons don't show correctly, STD_YES_NO_BUTTONS doesn't work
	    // var check = { value: true };
	    // var ifps = Components.interfaces.nsIPromptService;
	    // var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService();
	    // promptService = promptService.QueryInterface(ifps);
	    // var res = confirm(t,"BibTex databse selection",
	    // 		      ifps.STD_YES_NO_BUTTONS,null,null,null,"",check);
	    var res = win.confirm(t,"BibTex databse selection");
	    if(res){
		bib_file = this.dialog_FilePickerSave(win,"Select Bibtex file for "+doc,"Bibtex", "*.bib");
	    } else {
		bib_file = this.dialog_FilePickerOpen(win,"Select Bibtex file for "+doc,"Bibtex", "*.bib");
		if(!bib_file) return;
	    }

	    bib = bib_file.path;
	    if (bib_file) this.addNewDocument(doc,bib);
	    else return;//file dialog canceled
	}
	items = this.exportToBibtex(zitems);
	var keys = new Array();
	var zids = new Array();
	for (var id in items){
	    citekey = items[id][0];
	    text = items[id][1];
	    keys.push(citekey);
	    //check database, if not in, append to entries_text
	    //single key can be associated with several bibtex files
	    var res = this.DB.query("SELECT zid FROM keys WHERE key=\""+citekey+"\" AND bib=\""+bib+"\"");
	    if(!res){
		this.DB.query("INSERT INTO keys VALUES(null,\""+citekey+"\",\""+bib+"\",\""+id+"\")");
		zids.push(id)
		entries_text+=text;
	    }
	}
	if (!entries_text=="") this.writeBib(bib,entries_text,zids);
	this.lyxPipeWrite("citation-insert:"+keys.join(","));
    },
    
    createCiteKey: function(id,text){
	var ckre = /.*@[a-z]+\{([^,]+),{1}/;
	var oldkey = ckre.exec(text)[1];
	var dic = new Array();
	dic["zotero"] = id;
	if (this.prefs.getCharPref("citekey") == "zotero"){
	    var citekey = id;
	    text = text.replace(oldkey,citekey);
	    return [citekey,text];
	    return;
	}

	var creators;
	var authors;
	var author;
	var c = "";
	var chars = "";
	var t;
	var title;
	var year;
	var p;
	var citekey = "";
	var text;
	
	// NAME
	ckre = /author\s?=\s?\{(.*)\},?\n/;
	creators = ckre.exec(text);
	if (!creators){
	    ckre = /editor\s?=\s?\{(.*)\},?\n/;
	    creators = ckre.exec(text);
	}
	authors = creators[1];
	if (authors.split(" and ").length>1){
	    author = authors.split(" and ")[0].split(" ");
	    author = author[author.length-1].toLowerCase();
	} else {
	    author = authors.split(" ");
	    author = author[author.length-1].toLowerCase();
	}	
	// replace accented characters
	ckre = /\{([a-zA-Z]{1})\}/;
	chars = author.split("");
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
	
	t = ckre.exec(text)[1].toLowerCase();
	t = t.replace(/[^a-z0-9\s]/g,"");
	t = t.split(" ");
	t.reverse();
	title = t.pop();
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
	for (var i=0;i<p.length;i++){
	    if (p[i] in dic) {citekey+=dic[p[i]];}
	    else citekey+=p[i];
	}
	citekey = citekey.replace("{","");
	citekey = citekey.replace("}","");
	//check if cite key exists
	var res = this.DB.query("SELECT key FROM keys WHERE key=\""+citekey+"\"");
	if (res.length>1) citekey+=(res.length+1);
	text = text.replace(oldkey,citekey);
	return [citekey,text];
    },
    

    exportToBibliography: function(item){
	var format = "bibliography=http://www.zotero.org/styles/chicago-author-date";
	var biblio = Zotero.QuickCopy.getContentFromItems([item],format);
	return biblio.text;
    },
    
    exportToBibtex: function (items){
	// returns hash {id:[citekey,text]}
	var text;
	var callback = function(obj, worked) {
	    text = obj.output.replace(/\r\n/g, "\n");
	};
	var translation = new Zotero.Translate("export");
	translation.setTranslator('9cb70025-a888-4a29-a210-93ec52da40d4');
	translation.setHandler("done", callback);
	    
	var tmp = new Array();
	for (var i=0;i<items.length;i++){
	    var id =Zotero.Items.getLibraryKeyHash(items[i]);
	    translation.setItems([items[i]]);
	    translation.translate();
	    var ct = this.createCiteKey(id,text);
	    tmp[id] = [ct[0],ct[1]];
	}
	return tmp;
    },
    
    dbDeleteBib: function(){
	//
	var win = this.wm.getMostRecentWindow("navigator:browser"); 
	var dic = this.DB.query("SELECT bib FROM docs GROUP BY bib");
	var params = {inn:{items:dic,type:"bib"},
    		      out:null};       
    	var res = win.openDialog("chrome://lyz/content/select.xul", "",
    		       "chrome, dialog, modal, centerscreen, resizable=yes",params);
	if(!res) return;
	var bib;
    	if (params.out) {
	    bib = params.out.item;
    	}	
	var res = win.confirm("You are about to delete record of BibTeX database:\n"+
			      bib+"\nRecord about associated documents will also be deleted.\n",
			      "Deleting LyZ database record");
	if(!res) return;
	this.DB.query("DELETE FROM docs WHERE bib=\""+bib+"\"");
	this.DB.query("DELETE FROM keys WHERE bib=\""+bib+"\"");
    },
    
    dbDeleteDoc: function(doc,bib){
	var win = this.wm.getMostRecentWindow("navigator:browser"); 
	var dic = this.DB.query("SELECT doc FROM docs");
	var params = {inn:{items:dic,type:"doc"},
    		      out:null};       
    	var res = win.openDialog("chrome://lyz/content/select.xul", "",
    		       "chrome, dialog, modal, centerscreen, resizable=yes",params);
	if (!res) return;
	var doc;
    	if (params.out) {
	    doc = params.out.item;
    	}	
	var res = win.confirm("Do you really want to delete document:\n"+
			      doc+"?","Deleting LyZ database record");
	if(!res) return;
	this.DB.query("DELETE FROM docs WHERE doc=\""+doc+"\"");
    },
    
    dbRenameDoc: function(){
	var win = this.wm.getMostRecentWindow("navigator:browser"); 
	var dic = this.DB.query("SELECT id,doc FROM docs");
	var params = {inn:{items:dic,type:"doc"},
    		      out:null};       
    	var res = win.openDialog("chrome://lyz/content/select.xul", "",
    		       "chrome, dialog, modal, centerscreen, resizable=yes",params);
	if (!res) return;
	var doc;
    	if (params.out) {
	    doc = params.out.item;
    	}	
	newfname = this.dialog_FilePickerOpen(win,"Select LyX document for "+doc,"LyX", "*.lyx").path;
	if(!newfname) return;
	this.DB.query("UPDATE docs SET doc=\""+newfname+"\" WHERE id=\""+id+"\"");
	
    },
    
    dbRenameBib: function(){
	var win = this.wm.getMostRecentWindow("navigator:browser"); 
	var dic = this.DB.query("SELECT bib FROM docs");
	var params = {inn:{items:dic,type:"bib"},
    		      out:null};
    	var res = win.openDialog("chrome://lyz/content/select.xul", "",
    		       "chrome, dialog, modal, centerscreen, resizable=yes",params);
	if (!res) return;
	var bib;
    	if (params.out) {
	    bib = params.out.item;
    	}	
	newfname = this.dialog_FilePickerOpen(win,"Select Bibtex file for "+bib,"Bibtex", "*.bib").path;
	if(!newfname) return;
	this.DB.query("UPDATE docs SET bib=\""+newfname+"\" WHERE bib=\""+bib+"\"");	
	this.DB.query("UPDATE keys SET bib=\""+newfname+"\" WHERE bib=\""+bib+"\"");
    },
    
    syncBibtexKeyFormat: function(doc,oldkeys,newkeys){
    	var win = this.wm.getMostRecentWindow("navigator:browser");
	this.lyxPipeWrite("buffer-write");
	this.lyxPipeWrite("buffer-close");	    
    	var lyxfile = Components.classes["@mozilla.org/file/local;1"]
    	    .createInstance(Components.interfaces.nsILocalFile);
	// LyX returns linux style paths, which don't work on Windows
	var oldpath = doc;
	try{
	    lyxfile.initWithPath(doc);
	}
	catch (e){
	    doc = doc.replace(/\//g,"\\");
	    lyxfile.initWithPath(doc);
	}
    	if(!lyxfile.exists()){
    	    win.alert("The specified "+doc+" does not exist.");
    	    return;
    	}

	//remove old backup file
	var tmpfile = Components.classes["@mozilla.org/file/local;1"]
    	    .createInstance(Components.interfaces.nsILocalFile);
	tmpfile.initWithPath(doc+".lyz");
    	if(tmpfile.exists()){
    	    tmpfile.remove(1);    	
	}
	// make new backup
	lyxfile.copyTo(null,lyxfile.leafName+".lyz");
	
	// that main procedure
	try {
    	    var lyxfile_stream = Components.classes["@mozilla.org/network/file-input-stream;1"].
		createInstance(Components.interfaces.nsIFileInputStream);
	    var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
		createInstance(Components.interfaces.nsIConverterInputStream);
	    lyxfile_stream.init(lyxfile, -1, 0, 0);
	    cstream.init(lyxfile_stream, "UTF-8", 0, 0);
	    var text = "";
	    var str = {};
	    cstream.readString(-1, str); // read the whole file and put it in str.value
	    text = str.value;
	    cstream.close();
	    
	    // replace new cite keys
	    var lines = text.split("\n");
	    var map = new Array();
	    for (var zid in newkeys){
		re = new RegExp(oldkeys[zid],"g");
		text = text.replace(re,newkeys[zid]);
	    }
	    //write our the modified LyX document
	    var lyxfile_stream = Components.classes["@mozilla.org/network/file-output-stream;1"].
	    	createInstance(Components.interfaces.nsIFileOutputStream);
	    lyxfile_stream.init(lyxfile, 0x02| 0x20, 0666, 0);// write , truncate
	    var cstream = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
	    	.createInstance(Components.interfaces.nsIConverterOutputStream);
	    cstream.init(lyxfile_stream, "UTF-8", 0, 0);	
	    cstream.writeString(text);
	    cstream.close();
	    
	} catch (e){ alert("Please report the following error:\n"+e);}
	this.lyxPipeWrite("file-open:"+oldpath);	
    },
    
    writeBib: function(bib,entries_text,zids) {
	var win = this.wm.getMostRecentWindow("navigator:browser");
	//FIXME: can't get nsIUnicharLineInputStream.readLine to work...
	if (!this.replace){//will append to the file
	    var bibfile = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	    bibfile.initWithPath(bib);
	    if(!bibfile.exists()){
		win.alert("BibTeX file "+bib+" does not exist.");
		return;
	    }
	    var bibfile_stream = Components.classes["@mozilla.org/network/file-input-stream;1"].
		createInstance(Components.interfaces.nsIFileInputStream);
	    cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
		createInstance(Components.interfaces.nsIConverterInputStream);
	    bibfile_stream.init(bibfile, -1, 0, 0);
	    cstream.init(bibfile_stream, "UTF-8", 0, 0);
	    var text = "";
	    var str = {};
	    cstream.readString(-1, str); // read the whole file and put it in str.value
	    text = str.value;
	    cstream.close();
	    text = text.split("\n");
	    var firstline = text.splice(0,1)+" "+zids.join(" ");
	    text = text.join("\n");
	}
	
	// now write new bibtex file
	var fbibtex = Components.classes["@mozilla.org/file/local;1"]
	    .createInstance(Components.interfaces.nsILocalFile);
	fbibtex.initWithPath(bib);
	var fbibtex_stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
	    .createInstance(Components.interfaces.nsIFileOutputStream);

	// if (this.append) {
	//     this.append = false;
	fbibtex_stream.init(fbibtex, 0x02| 0x20, 0666, 0);// write , truncate
	// }
	// else fbibtex_stream.init(fbibtex, 0x02| 0x10, 0666, 0); // write, append
	
	var cstream = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
	    .createInstance(Components.interfaces.nsIConverterOutputStream);
	cstream.init(fbibtex_stream, "UTF-8", 0, 0);	
	
	if (!this.replace){//append new entries
	    cstream.writeString(firstline+"\n"+text+"\n"+entries_text);
	} else cstream.writeString(zids.join(" ")+"\n"+entries_text);
	cstream.close();
	this.replace = false;
    },
    
    updateBibtexAll: function(){
	//first update from the bibtex file
	this.updateFromBibtexFile();
	
	// update when zotero items are modified
	var win = this.wm.getMostRecentWindow("navigator:browser"); 
	var res = this.checkDocInDB();
	var doc = res[1];
	var bib = res[0];
	if (!bib) {
	    alert("There is no BibTeX database associated with the active LyX document: "+doc);
	    return;
	}
	var citekey = this.prefs.getCharPref("citekey");

	var p = win.confirm("You are going to update BibTeX database:\n\n"+
		      bib+"\n\nCurrent BibTex key format \""+
		      citekey+"\" will be used.\nDo you want to continue?");
	if (p){
	    // get all ids for the bibtex file
	    var ids_h = this.DB.query("SELECT zid,key FROM keys WHERE bib=\""+bib+"\" GROUP BY zid");
	    var ids = new Array();
	    var oldkeys = new Array();
	    for (var i=0;i<ids_h.length;i++){
		var zid = ids_h[i]['zid'];
		ids.push(this.getZoteroItem(zid));
		oldkeys[zid] = ids_h[i]['key'];
	    }
	    
	    var ex = this.exportToBibtex(ids);
	    var zids = new Array();
	    var newkeys = new Array();
	    var text = "";
	    for (var id in ex){
		text+=ex[id][1];
		zids.push(id);
		newkeys[id] = ex[id][0];
	    }
	    if (! (oldkeys.length == newkeys.length)) {alert("Aborting"); return;}
	    this.replace = true;
	    
	    // now is time to update db, bibtex and lyx
	    for (var zid in newkeys){
		this.DB.query("UPDATE keys SET key=\""+newkeys[zid]+
			      "\" WHERE zid=\""+zid+"\" AND bib=\""+bib+"\"");
	    }
	    this.writeBib(bib,text,zids);
	    var res = win.confirm("Your BibTeX database "+bib+" has been updated.\n"+
				  "Do you also want to update the LyX document:\n\n"+
				  doc+"\n\n"+
				  "This is only necessary when any author, title or year has been modified,\n"
				  +"or when the BibTex key format has been changed.\n"+
				  "The active LyX document will be saved, closed and backed up (*.lyz).");
	    if (!res) return;
	    this.syncBibtexKeyFormat(doc,oldkeys,newkeys);
	}
    },
    
    
    updateFromBibtexFile: function(){
	var win = this.wm.getMostRecentWindow("navigator:browser"); 
	var res = this.checkDocInDB();
	var doc = res[1];
	var bib = res[0];
	
	if (!bib) {
	    win.alert("There is no BibTeX database associated with the active LyX document: "+doc);
	    return;
	}
	//FIXME: can't get nsIUnicharLineInputStream.readLine to work...
	var bibfile = Components.classes["@mozilla.org/file/local;1"]
	    .createInstance(Components.interfaces.nsILocalFile);
	bibfile.initWithPath(bib);
	if(!bibfile.exists()){
	    win.alert("BibTeX file "+bib+" does not exist.");
	    return;
	}
	var bibfile_stream = Components.classes["@mozilla.org/network/file-input-stream;1"].
            createInstance(Components.interfaces.nsIFileInputStream);
	cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
	    createInstance(Components.interfaces.nsIConverterInputStream);
	bibfile_stream.init(bibfile, -1, 0, 0);
	cstream.init(bibfile_stream, "UTF-8", 0, 0);
	var line = "";
	var str = {};
	cstream.readString(-1, str); // read the whole file and put it in str.value
	line = str.value.split("\n")[0];
	cstream.close();
	
	var ar = line.split(" ");
	var info = "";
	for (var i=1;i<ar.length;i+=2){
	    var zid = ar[i];
	    var res = this.DB.query("SELECT * FROM keys WHERE zid=\""+zid+"\" AND bib=\""+bib+"\"");
	    if(!res){
		info+=zid+": "+this.exportToBibliography(this.getZoteroItem(zid))+"\n";
		this.DB.query("INSERT INTO keys VALUES(null,\""+zid+"\",\""+bib+"\",\""+zid+"\")");
	    }
	}
	
	if (!info=="") win.alert("The following items where added:\n"+info);
	
    },
    
    getZoteroItem: function(key){
	var keyhash = Zotero.Items.parseLibraryKeyHash(key);
	return Zotero.Items.getByLibraryAndKey(keyhash.libraryID, keyhash.key);

    },

    dialog_FilePickerOpen: function(win,title,filter_title,filter){
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(win, title, nsIFilePicker.modeOpen);
	fp.appendFilter(filter_title,filter);
	var res = fp.show();
	if (res == nsIFilePicker.returnOK){
	    return fp.file;
	}
    },

    dialog_FilePickerSave: function(win,title,filter_title,filter){
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(win, title, nsIFilePicker.modeSave);
	fp.appendFilter(filter_title,filter);
	var res = fp.show();
	if (res == nsIFilePicker.returnOK){
	    // add default extension, guess there must be other way to do it
	    // but this is what came to my mind first
	    if (fp.file.path.split(".").length<2){
		// this is weird, but I don't know how to set new path
		var file = Components.classes["@mozilla.org/file/local;1"]
		    .createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(fp.file.path+".bib");
		file.create(file.NORMAL_FILE_TYPE,0666);
		return file;
	    } else {// overwrite the file if it exists
		this.replace = true;
		return fp.file;
	    }
	} else if (res == nsIFilePicker.returnReplace){
	    this.replace = true;
	    return fp.file;
	}
    }
}

