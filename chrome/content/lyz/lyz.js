// Credits:
// - small bits were borrowed from Lytero by Demetrio Girardi, lytero@dementrioatgmail.com

Zotero.Lyz = {
    
    prefs: null,
    DB: null,
    replace: false,
    wm: null,
    
    init: function () {
	//set up preferences
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"].
	    getService(Components.interfaces.nsIPrefService);
	this.prefs = this.prefs.getBranch("extensions.lyz.");	
	
	this.wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);

	this.DB = new Zotero.DBConnection("lyz");
	var sql;
	if (!this.DB.tableExists('docs')) {
	    sql = "CREATE TABLE docs (id INTEGER PRIMARY KEY, doc TEXT, bib TEXT)"
	    this.DB.query(sql);
	    sql = "CREATE TABLE keys (id INTEGER PRIMARY KEY, key TEXT, bib TEXT, zid TEXT)"
	    this.DB.query(sql);
	} 
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
	if (fname==null) {
	    win.alert("ERROR: lyxGetDoc: "+res);
	    return;
	}
	return fname[1];
    },
    
    lyxGetOpenDocs: function(){
	var docs = new Array();
	original = this.lyxGetDoc();
	docs.push(original);
	var name;
	var go = true;
	do {
	    this.lyxPipeWrite("buffer-next");
	    name = this.lyxGetDoc();
	    if (original==name){
		go = false;//not necessary
		return docs;
	    }
	    docs.push(name);
	} while (go);
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

	try {
	    pipein = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	    pipein.initWithPath(this.prefs.getCharPref("lyxserver")+".in");
	} catch(e){
	    win.alert("Wrong path to Lyx server:\n"+this.prefs.getCharPref("lyxserver")+"\n"+e);
	    return false;
	}

	if(!pipein.exists()){
	    win.alert("Wrong path to Lyx server.\nSet the path specified in Lyx preferences.");
	    return false;
	}
	
	try {
	    pipein_stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
		.createInstance(Components.interfaces.nsIFileOutputStream);
	    pipein_stream.init(pipein, 0x02| 0x10, 0666, 0); // write, append
	} catch(e){
	    win.alert("Failed to:\n"+command);
	    return;
	}
	
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
	//win.alert("1");
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
	    t+= "Press Cancel to select from your existing databases\n";
	    
	    // FIXME: the buttons don't show correctly, STD_YES_NO_BUTTONS doesn't work
	    // var check = { value: true };
	    // var ifps = Components.interfaces.nsIPromptService;
	    // var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService();
	    // promptService = promptService.QueryInterface(ifps);
	    // var res = confirm(t,"BibTex databse selection",
	    // 		      ifps.STD_YES_NO_BUTTONS,null,null,null,"",check);
	    var res = win.confirm(t,"BibTex database selection");
	    if(res){
		bib_file = this.dialog_FilePickerSave(win,"Select Bibtex file for "+doc,"Bibtex", "*.bib");
		if (!bib_file) return;
		
	    } else {
		bib_file = this.dialog_FilePickerOpen(win,"Select Bibtex file for "+doc,"Bibtex", "*.bib");
		if(!bib_file) return;
	    }
	    
	    bib = bib_file.path;
	    if (bib_file) this.addNewDocument(doc,bib);
	    else return;//file dialog canceled
	}
	//win.alert("2");
	items = this.exportToBibtex(zitems,bib);
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
	res = this.lyxPipeWrite("citation-insert:"+keys.join(","));
	//win.alert("3");
    },
    
    createCiteKey: function(id,text,bib){
	var win = this.wm.getMostRecentWindow("navigator:browser");
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
	try {
	    year = ckre.exec(text)[1].replace(" ","");
	} catch (e) {
	    win.alert("All entries should to be dated. Please add a date to:\n"+text);
	    year = "????";
	}
	dic["year"] = year;
	// custom cite key
	p = this.prefs.getCharPref("citekey").split(" ");
	for (var i=0;i<p.length;i++){
	    if (p[i] in dic) {citekey+=dic[p[i]];}
	    else citekey+=p[i];
	}
	citekey = citekey.replace("{","");
	citekey = citekey.replace("}","");
	re = /[^a-z0-9\!\$\&\*\+\-\.\/\:\;\<\>\?\[\]\^\_\`\|]+/g;
	citekey = citekey.replace(re,"");
	//check if cite key exists
	var res = this.DB.query("SELECT key,zid FROM keys WHERE bib=\""+bib+"\" AND key=\""+citekey+"\" AND zid<>\""+id+"\"");
	if (res.length>0) citekey+=(res.length+1);
	text = text.replace(oldkey,citekey);
	return [citekey,text];
    },
    

    exportToBibliography: function(item){
	var format = "bibliography=http://www.zotero.org/styles/chicago-author-date";
	var biblio = Zotero.QuickCopy.getContentFromItems([item],format);
	return biblio.text;
    },
    
    exportToBibtex: function (items,bib){
	// returns hash {id:[citekey,text]}
	var text;
	var callback = function(obj, worked) {
	    text = obj.output.replace(/\r\n/g, "\n");
	};
	var win = this.wm.getMostRecentWindow("navigator:browser");
	var translation = new Zotero.Translate("export");
	translation.setTranslator('9cb70025-a888-4a29-a210-93ec52da40d4');
	
	translation.setHandler("done", callback);
	//FIXME: not sure why this works
	translation.setDisplayOptions({"exportCharset":"\"UTF-8\""});
	var tmp = new Array();
	for (var i=0;i<items.length;i++){
	    var id =Zotero.Items.getLibraryKeyHash(items[i]);
	    translation.setItems([items[i]]);
	    translation.translate();
	    var ct = this.createCiteKey(id,text,bib);
	    tmp[id] = [ct[0],ct[1]];
	}
	return tmp;
    },
    
    dbDeleteBib: function(){
	var win = this.wm.getMostRecentWindow("navigator:browser"); 
	var dic = this.DB.query("SELECT bib FROM docs GROUP BY bib");
	var params = {inn:{items:dic,type:"bib"},
    		      out:null};       
    	var res = win.openDialog("chrome://lyz/content/select.xul", "",
    		       "chrome, dialog, modal, centerscreen, resizable=yes",params);
	if(!params.out) return;
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
	if(!params.out) return;
	
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
	if (!params.out) return;
	var doc;
    	if (params.out) {
	    doc = params.out.item;
    	}	
	newfname = this.dialog_FilePickerOpen(win,"Select LyX document for "+doc,"LyX", "*.lyx").path;
	if(!newfname) return;
	this.DB.query("UPDATE docs SET doc=\""+newfname+"\" WHERE doc=\""+doc+"\"");
	
    },
    
    dbRenameBib: function(){
	var win = this.wm.getMostRecentWindow("navigator:browser"); 
	var dic = this.DB.query("SELECT bib FROM docs");
	var params = {inn:{items:dic,type:"bib"},
    		      out:null};
    	var res = win.openDialog("chrome://lyz/content/select.xul", "",
    		       "chrome, dialog, modal, centerscreen, resizable=yes",params);
	if (!params.out) return;
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
	//this.lyxPipeWrite("buffer-write");
	//this.lyxPipeWrite("buffer-close");	    
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
	try {
	    var tmpfile = Components.classes["@mozilla.org/file/local;1"]
    		.createInstance(Components.interfaces.nsILocalFile);
	    tmpfile.initWithPath(doc+".lyz~");
    	    if(tmpfile.exists()){
    		tmpfile.remove(1);    	
	    }
	} catch (e){
	    win.alert("Please report the following error:\n"+e);
	    return;
	}
	// make new backup
	lyxfile.copyTo(null,lyxfile.leafName+".lyz~");
	// that main procedure
	win.alert("Updating "+doc);
	try {
	    cstream = this.fileReadByLine(doc+".lyz~");
	    outstream = this.fileWrite(doc)[1];
	    var line = {}, lines = [], hasmore;
	    re = /key\s\"([^\"].*)\"/;
	    do {
		
		hasmore = cstream.readLine(line);
		var tmp = line.value;
		if (tmp.search('key')==0){
		    var tmpkeys = re.exec(tmp)[1].split(',');
		    for (var i=0;i<tmpkeys.length;i++){
			var o = tmpkeys[i];
			var n = newkeys[oldkeys[tmpkeys[i]]];
			tmp = tmp.replace(o,n);
		    }
		}
		outstream.writeString(tmp+"\n");
	    } while(hasmore);
	    
	    cstream.close();
	} catch (e){ 
	    win.alert("Please report the following error:\n"+e);
	    var oldfile = Components.classes["@mozilla.org/file/local;1"]
    		.createInstance(Components.interfaces.nsILocalFile);
	    oldfile.initWithPath(doc);
    	    if(oldfile.exists()){
    		oldfile.remove(1);    	
	    }
	    // make new backup
	    tmpfile.copyTo(null,lyxfile.leafName);
	
	}
	//this.lyxPipeWrite("file-open:"+oldpath);	
    },
    
    writeBib: function(bib,entries_text,zids) {
	var win = this.wm.getMostRecentWindow("navigator:browser");
	if (!this.replace){//will append to the file
	    var bib_backup = this.fileBackup(bib);
	    if (!bib_backup) {win.alert("Backup failed."); return;}
	    cstream = this.fileReadByLine(bib_backup);
	    outstream = this.fileWrite(bib)[1];
	    var line = {}, lines = [], hasmore;
	    cstream.readLine(line);
	    outstream.writeString(line.value+" "+zids.join(" ")+"\n");	    
	    do {
		hasmore = cstream.readLine(line);
		outstream.writeString(line.value+"\n");
	    } while(hasmore);
	    outstream.writeString(entries_text);
	    outstream.close();
	    cstream.close();
	    return;
	}
	
	var fbibtex_stream, cstream;
	[fbibtex_stream,cstream] = this.fileWrite(bib);

	var data = zids.join(" ")+"\n"+entries_text;	
	cstream.writeString(data);
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
	    win.alert("There is no BibTeX database associated with the active LyX document: "+doc);
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
		oldkeys[ids_h[i]['key']] = zid;
	    }
	    
	    var ex = this.exportToBibtex(ids,bib);
	    var zids = new Array();
	    var newkeys = new Array();
	    var text = "";
	    for (var id in ex){
		text+=ex[id][1];
		zids.push(id);
		newkeys[id] = ex[id][0];
	    }
	    if (! (oldkeys.length == newkeys.length)) {win.alert("Aborting"); return;}
	    this.replace = true;
	    
	    // now is time to update db, bibtex and lyx
	    for (var zid in newkeys){
		this.DB.query("UPDATE keys SET key=\""+newkeys[zid]+
			      "\" WHERE zid=\""+zid+"\" AND bib=\""+bib+"\"");
	    }
	    this.writeBib(bib,text,zids);
	    var res = win.confirm("Your BibTeX database "+bib+" has been updated.\n"+
				  "Do you also want to update the associated LyX documents?\n"+
				  "This is only necessary when any author, title or year has been modified,\n"
				  +"or when the BibTex key format has been changed.");
	    if (!res) return;
	    
	    var tmp = this.DB.query("SELECT doc FROM docs where bib=\""+bib+"\"");
	    
	    //if (tmp.length==1){
	    this.lyxPipeWrite("buffer-write");
	    this.lyxPipeWrite("buffer-close");	    
	    this.syncBibtexKeyFormat(doc,oldkeys,newkeys);
	    this.lyxPipeWrite("file-open:"+doc);
	    //} // else {
	    // 	var docs = new Array();
	    // 	var open_docs = this.lyxGetOpenDocs();
	    // 	this.lyxPipeWrite("buffer-write-all");
	    // 	for (var i=0;i<open_docs.length;i++){
	    // 	    this.lyxPipeWrite("buffer-close");
	    // 	}
	    // 	for (var k=0;k<tmp.length;k++){
	    // 	    var d = tmp[k]['doc'];
	    // 	    this.syncBibtexKeyFormat(d,oldkeys,newkeys);
	    // 	}
		
	    // 	for (var j=0;j<open_docs.length;j++){
	    // 	    this.lyxPipeWrite("file-open:"+open_docs[j]);
	    // 	}
	    // }
	    
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
	var cstream = this.fileReadByLine(bib);
	var line = {};
	cstream.readLine(line); // read the whole file and put it in str.value
	line = line.value;
	cstream.close();
	var ar = line.trim().split(" ");
	var info = "";
	for (var i=0;i<ar.length;i++){
	    var zid = ar[i];
	    var res = this.DB.query("SELECT * FROM keys WHERE zid=\""+zid+"\" AND bib=\""+bib+"\"");
	    if(!res){
		info+=zid+": "+this.exportToBibliography(this.getZoteroItem(zid))+"\n";
		// key=zid is not right, but it will be updated when updateBibtex is run
		res = this.DB.query("INSERT INTO keys VALUES(null,\""+zid+"\",\""+bib+"\",\""+zid+"\")");
		if (!res) {win.alert("ERROR: INSERT INTO keys VALUES(null,\""+zid+"\",\""+bib+"\",\""+zid+"\")");}
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
	} else {return false;}
    },
    
    fileReadByLine: function(path){
	var file = Components.classes["@mozilla.org/file/local;1"]
	    .createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(path);
	if(!file.exists()){
	    win.alert("File "+path+" does not exist.");
	    return;
	}
	var file_stream = Components.classes["@mozilla.org/network/file-input-stream;1"].
	    createInstance(Components.interfaces.nsIFileInputStream);
	cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
	    createInstance(Components.interfaces.nsIConverterInputStream);
	file_stream.init(file, -1, 0, 0);
	cstream.init(file_stream, "UTF-8", 1024, 0xFFFD);
	cstream.QueryInterface(Components.interfaces.nsIUnicharLineInputStream);
	return cstream;
    },
    
    fileBackup: function(path){
	var oldfile = Components.classes["@mozilla.org/file/local;1"]
    	    .createInstance(Components.interfaces.nsILocalFile);
	oldfile.initWithPath(path);
    	
	var file = Components.classes["@mozilla.org/file/local;1"]
    	    .createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(path+".lyz~");
    	if(file.exists()){
    	    file.remove(1);    	
	}
	// make new backup
	oldfile.copyTo(null,oldfile.leafName+".lyz~");
	return path+".lyz~";
    },
    
    fileWrite: function(path){
	var win = this.wm.getMostRecentWindow("navigator:browser");
	var file = Components.classes["@mozilla.org/file/local;1"]
	    .createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(path);
	var file_stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
	    .createInstance(Components.interfaces.nsIFileOutputStream);

	file_stream.init(file, 0x02| 0x20, 0666, 0);// write , truncate
	var cstream = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
	    .createInstance(Components.interfaces.nsIConverterOutputStream);
	//this comes (dissected) from Zotero's translate.js
	var cstream = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
	    .createInstance(Components.interfaces.nsIConverterOutputStream);
	
	cstream.init(file_stream,"UTF-8", 1024, "?".charCodeAt(0));
	
	file_stream.write("\xEF\xBB\xBF", "\xEF\xBB\xBF".length);
	return [file_stream,cstream];
    }, 
    
    test: function(){
	var win = this.wm.getMostRecentWindow("navigator:browser"); 
	var t = prompt("Command","server-get-filename");
	if (!t) {
	    win.alert("Error: !t");
	    return;
	}
	this.lyxPipeWrite(t);
	win.alert("After write");
	var t = this.lyxPipeRead();
	win.alert("RESPONSE: "+t);
    }
    
}

