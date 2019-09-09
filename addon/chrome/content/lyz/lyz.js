// Credits:
// - small bits were borrowed from Lytero by Demetrio Girardi, lytero@dementrioatgmail.com
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/osfile.jsm");

Zotero.Lyz = {

    prefs : null,
    DB : null,
    replace : false,
    wm : null,
    os: null,

    init : function() {
        //set up preferences
        this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
                .getService(Components.interfaces.nsIPrefService);
        this.prefs = this.prefs.getBranch("extensions.lyz.");
        this.os = this.prefs.getCharPref("os");
        
        if (this.os === ""){
            if (navigator.platform.indexOf("Win")===0){
                this.os = "Win";
            } else {// assuming this works also for MacOS better
                this.os = "Linux";
            }
            this.prefs.setCharPref("os", this.os);
        }
        
        this.wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                .getService(Components.interfaces.nsIWindowMediator);

        var shutdownObserver = {observe: this.shutdown}
        Services.obs.addObserver(shutdownObserver, "quit-application", false);

        var sqlDocs = "CREATE TABLE IF NOT EXISTS docs (id INTEGER PRIMARY KEY, doc TEXT, bib TEXT)";
        var sqlKeys = "CREATE TABLE IF NOT EXISTS keys (id INTEGER PRIMARY KEY, key TEXT, bib TEXT, zid TEXT)";
        Zotero.Promise.coroutine(function*(context) {
            yield Zotero.Schema.schemaUpdatePromise
            context.DB = new Zotero.DBConnection("lyz");
            yield context.DB.queryAsync(sqlDocs);
            yield context.DB.queryAsync(sqlKeys);
            if (context.prefs.getBoolPref('checkZotero5Migration')) {
                context.migrateToZotero5()
            }
        })(this)
    },

    lyxGetDoc : function() {
        var res, fre, fname;
        var win = this.wm.getMostRecentWindow("navigator:browser");
        if (this.os=="Win"){
            res = this.lyxAskServer("server-get-filename");
        } else {
            res = this._lyxAskServer("server-get-filename");
        }
        if (!res) {
            win.alert("Could not contact server at: " +
                      this.prefs.getCharPref("lyxserver"));
            return null;
        }

        fre = /.*INFO:lyz:server-get-filename:(.*)\n/;
        fname = fre.exec(res);
        if (fname == null) {
            win.alert("ERROR: lyxGetDoc: \n\n" + res);
            return null;
        }
        return fname[1];
    },

    lyxGetOpenDocs : function() {
        var docs = [];
        var original = this.lyxGetDoc();
        docs.push(original);
        var name;
        var go = true;
        do {
            if (this.os=="Win"){
                res = this.lyxAskServer("buffer-next");
            } else {
                res = this._lyxAskServer("buffer-next");
            }
            name = this.lyxGetDoc();
            if (original == name) {
                go = false;//not necessary
                return docs;
            }
            docs.push(name);
        } while (go);
        return null;
    },

    lyxGetPos : function() {
        if (this.os=="Win"){
            res = this.lyxAskServer("server-get-xy");
        } else {
            res = this._lyxAskServer("server-get-xy");
        }
        var xy = /INFO:lyz:server-get-xy:(.*)/.exec(res)[1];
        return xy;
    },

    lyxPipeInit : function() {
        // reading from lyxpipe.out
        var pipeout;
        var path;
        var pipeout_stream;
        var cstream;
        var data;
        var str;
        var win = this.wm.getMostRecentWindow("navigator:browser");

        pipeout = Components.classes["@mozilla.org/file/local;1"]
                .createInstance(Components.interfaces.nsIFile);
        path = this.prefs.getCharPref("lyxserver");
        pipeout.initWithPath(path + ".out");
        if (!pipeout.exists()) {
            win.alert("The specified LyXServer pipe does not exist.");
            return null;
        }
        pipeout_stream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                .createInstance(Components.interfaces.nsIFileInputStream);
        cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
                .createInstance(Components.interfaces.nsIConverterInputStream);
        pipeout_stream.init(pipeout, -1, 0, 0);
        cstream.init(pipeout_stream, "UTF-8", 0, 0);
        return cstream;
    },

    /*
     * FIXME: two version of lyxPipeWriteRead and lyxAskServer, one combo works in Linux other in Windows
     * Problem: I don't know why.
     */
    lyxPipeWriteAndRead : function(command) {
        // Works in Windows
        // writing to lyxpipe.in
        var pipein, pipein_stream, msg, str, data;

        var win = this.wm.getMostRecentWindow("navigator:browser");

        try {
            pipein = Components.classes["@mozilla.org/file/local;1"]
                    .createInstance(Components.interfaces.nsIFile);
            pipein.initWithPath(this.prefs.getCharPref("lyxserver") + ".in");
        } catch (e) {
            win.alert("Wrong path to Lyx server:\n" +
                      this.prefs.getCharPref("lyxserver") + "\n" + e);
            return false;
        }

        if (!pipein.exists()) {
            win
                    .alert("Wrong path to Lyx server.\nSet the path specified in Lyx preferences.");
            return false;
        }

        try {
            pipein_stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                    .createInstance(Components.interfaces.nsIFileOutputStream);
            pipein_stream.init(pipein, 0x02 | 0x10, 0666, 0); // write, append
        } catch (e) {
            win.alert("Failed to:\n" + command);
            return false;
        }

        msg = "LYXCMD:lyz:" + command + "\n";
        pipein_stream.write(msg, msg.length);
        pipein_stream.close();

        data = "";
        str = {};

        // ----- open again
        var pipeout = Components.classes["@mozilla.org/file/local;1"]
                .createInstance(Components.interfaces.nsIFile);
        var path = this.prefs.getCharPref("lyxserver");
        pipeout.initWithPath(path + ".out");
        if (!pipeout.exists()) {
            win.alert("The specified LyXServer pipe does not exist.");
            return null;
        }
        var pipeout_stream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                .createInstance(Components.interfaces.nsIFileInputStream);
        var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
                .createInstance(Components.interfaces.nsIConverterInputStream);
        pipeout_stream.init(pipeout, -1, 0, 0);
        cstream.init(pipeout_stream, "UTF-8", 0, 0);

        cstream.readString(-1, str); // read the whole file and put it in str.value
        data = str.value;
        cstream.close();
        return data;
    },
    
    lyxAskServer : function(command) {
        // Works in Windows
        var win = this.wm.getMostRecentWindow("navigator:browser");

        try {
            return this.lyxPipeWriteAndRead(command);
        } catch (x) {
            win.alert("SERVER ERROR:\n" + x);
            return false;
        }
        return true;
    },
    
    _lyxPipeWriteAndRead: function(command,cstream){
        // Works in Linux 
        // writing to lyxpipe.in
        var pipein, pipein_stream, msg, str, data;
            
        var win = this.wm.getMostRecentWindow("navigator:browser"); 
        
        try {
            pipein = Components.classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsIFile);
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
            return false;
        }
        
        msg = "LYXCMD:lyz:"+command+"\n";
        pipein_stream.write(msg, msg.length);
        pipein_stream.close();
        
            data = "";
        str = {};
        cstream.readString(-1, str); // read the whole file and put it in str.value
        data = str.value;
        cstream.close();
        return data;
    },
    
    _lyxAskServer: function(command){
        // Works in Linux
        var win = this.wm.getMostRecentWindow("navigator:browser");
        var cstream;
        try {
            cstream = this.lyxPipeInit();            
        } catch (x) {
            win.alert("SERVER ERROR:\n"+x);
            return null;
        }
        try {
            return this._lyxPipeWriteAndRead(command,cstream);    
        } catch (x) {
            win.alert("SERVER ERROR:\n"+x);
            return null;
        }
        return True;
    },

    settings : function() {
        if (this.lyzDisableCheck()) {
            return
        }

        function openSettings(context, translators) {
            var params, inn, out;
            var win = context.wm.getMostRecentWindow("navigator:browser");
            params = {
                inn : {
                    citekey : context.prefs.getCharPref("citekey"),
                    createcitekey: context.prefs.getBoolPref("createCiteKey"),
                    lyxserver : context.prefs.getCharPref("lyxserver"),
                    selectedTranslator:context.prefs.getCharPref("selectedTranslator"),
                    translators:translators
                },
                out : null
            };
            win.openDialog("chrome://lyz/content/settings.xul", "",
                    "chrome, dialog, modal, centerscreen, resizable=yes", params);

            if (params.out) {
                context.prefs.setCharPref("citekey", params.out.citekey);
                context.prefs.setCharPref("lyxserver", params.out.lyxserver);
                context.prefs.setBoolPref("createCiteKey", params.out.createcitekey);
                context.prefs.setCharPref("selectedTranslator",params.out.selectedTranslator);
                context.prefs.setBoolPref("useJournalAbbreviation",params.out.useJournalAbbreviation);
            }
        }

        var translation = new Zotero.Translate("export");

        Zotero.Promise.coroutine(function* (context) {
            var translators = yield translation.getTranslators()
            openSettings(context, translators)
        })(this)
    },

    exportToBibliography : function(item) {
        var win = this.wm.getMostRecentWindow("navigator:browser");
        var format = "bibliography=http://www.zotero.org/styles/chicago-author-date";
        var biblio = Zotero.QuickCopy.getContentFromItems([ item ], format);
        return biblio.text;
    },

    syncBibtexKeyFormat : function(doc, oldkeys, newkeys) {
        var cstream, outstream, re, lyxfile, oldpath, tmpfile;
        var win = this.wm.getMostRecentWindow("navigator:browser");
        //this.lyxPipeWrite("buffer-write");
        //this.lyxPipeWrite("buffer-close");        
        lyxfile = Components.classes["@mozilla.org/file/local;1"]
                .createInstance(Components.interfaces.nsIFile);
        // LyX returns linux style paths, which don't work on Windows
        oldpath = doc;
        try {
            lyxfile.initWithPath(doc);
        } catch (e) {
            doc = doc.replace(/\//g, "\\");
            lyxfile.initWithPath(doc);
        }
        if (!lyxfile.exists()) {
            win.alert("The specified " + doc + " does not exist.");
            return;
        }
        //remove old backup file
        try {
            tmpfile = Components.classes["@mozilla.org/file/local;1"]
                    .createInstance(Components.interfaces.nsIFile);
            tmpfile.initWithPath(doc + ".lyz~");
            if (tmpfile.exists()) {
                tmpfile.remove(1);
            }
        } catch (e) {
            win.alert("Please report the following error:\n" + e);
            return;
        }
        // make new backup
        lyxfile.copyTo(null, lyxfile.leafName + ".lyz~");
        // that main procedure
        win.alert("Updating " + doc);
        try {
            cstream = this.fileReadByLine(doc + ".lyz~");
            outstream = this.fileWrite(doc)[1];
            var line = {}, lines = [], hasmore;
            re = /key\s\"([^\"].*)\"/;
            do {
                hasmore = cstream.readLine(line);
                var tmp = line.value;
                if (tmp.search('key') === 0) {
                    var tmpkeys = re.exec(tmp)[1].split(',');
                    for ( var i = 0; i < tmpkeys.length; i++) {
                        var o = tmpkeys[i];
                        var n = newkeys[oldkeys[tmpkeys[i]]];
                        // user can have citations from alternative bibtex file
                        // ignore those
                        if (n !== undefined)
                            tmp = tmp.replace(o, n);
                    }
                }
                outstream.writeString(tmp + "\n");
            } while (hasmore);

            cstream.close();
        } catch (e) {
            win.alert("Please report the following error:\n" + e);
            var oldfile = Components.classes["@mozilla.org/file/local;1"]
                    .createInstance(Components.interfaces.nsIFile);
            oldfile.initWithPath(doc);
            if (oldfile.exists()) {
                oldfile.remove(1);
            }
            // make new backup
            tmpfile.copyTo(null, lyxfile.leafName);

        }
        //this.lyxPipeWrite("file-open:"+oldpath);  
    },

    writeBib : function(bib, entries_text, zids) {
        var win = this.wm.getMostRecentWindow("navigator:browser");
        if (!this.replace) {//will append to the file
            var bib_backup = this.fileBackup(bib);
            if (!bib_backup) {
                win.alert("Backup failed.");
                return;
            }
            cstream = this.fileReadByLine(bib_backup);
            outstream = this.fileWrite(bib)[1];
            var line = {}, lines = [], hasmore;
            cstream.readLine(line);
            outstream.writeString(line.value + " " + zids.join(" ") + "\n");
            do {
                hasmore = cstream.readLine(line);
                outstream.writeString(line.value + "\n");
            } while (hasmore);
            outstream.writeString(entries_text);
            outstream.close();
            cstream.close();
            return;
        }
        var fbibtex_stream, cstream;
        [ fbibtex_stream, cstream ] = this.fileWrite(bib);
        var data = zids.join(" ") + "\n" + entries_text;
        cstream.writeString(data);
        cstream.close();
        fbibtex_stream.close();
        this.replace = false;
    },

    objectMethods : function(obj) {
        var output = '';
        for (var property in object) {
            output += property + ': ' + object[property] + '\n';
        }
        return output;
    },

    getZoteroItem : function(key) {
        var win = this.wm.getMostRecentWindow("navigator:browser");
//      keyhash = Zotero.Items.parseLibraryKeyHash(key);
//      var sql = "SELECT ROWID FROM " + this._ZDO_table + " WHERE ";
//      var params = [];
//      if (this._ZDO_idOnly) {
//          sql += "ROWID=?";
//          params.push(key);
//      }
//      else {
//          sql += "libraryID";
//          if (libraryID) {
//              sql += "=? ";
//              params.push(libraryID);
//          }
//          else {
//              sql += " IS NULL ";
//          }
//          sql += "AND key=?";
//          params.push(key);
//      }
//      var id = Zotero.DB.valueQuery(sql, params);
//      if (!id) {
//          return false;
//      }
//      return Zotero[this._ZDO_Objects].get(id);
        
        var keyhash = Zotero.Items.parseLibraryKeyHash(key);
        return Zotero.Items.getByLibraryAndKey(keyhash.libraryID, keyhash.key);
    },
    
    

    dialog_FilePickerOpen : function(win, title, filter_title, filter) {
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var fp = Components.classes["@mozilla.org/filepicker;1"]
                .createInstance(nsIFilePicker);
        fp.init(win, title, nsIFilePicker.modeOpen);
        fp.appendFilter(filter_title, filter);
        var res = fp.show();
        if (res == nsIFilePicker.returnOK) {
            return fp.file;
        }
        return null;
    },

    dialog_FilePickerSave : function(win, title, filter_title, filter) {
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var fp = Components.classes["@mozilla.org/filepicker;1"]
                .createInstance(nsIFilePicker);
        fp.init(win, title, nsIFilePicker.modeSave);
        fp.appendFilter(filter_title, filter);
        var res = fp.show();
        if (res == nsIFilePicker.returnOK) {
            // add default extension, guess there must be other way to do it
            // but this is what came to my mind first
            if (fp.file.path.split(".").length < 2) {
                // this is weird, but I don't know how to set new path
                var file = Components.classes["@mozilla.org/file/local;1"]
                        .createInstance(Components.interfaces.nsIFile);
                file.initWithPath(fp.file.path + ".bib");
                file.create(file.NORMAL_FILE_TYPE, 0666);
                return file;
            } else {// overwrite the file if it exists
                this.replace = true;
                return fp.file;
            }
        } else if (res == nsIFilePicker.returnReplace) {
            this.replace = true;
            return fp.file;
        } else {
            return false;
        }
    },

    fileReadByLine : function(path) {
        var file = Components.classes["@mozilla.org/file/local;1"]
                .createInstance(Components.interfaces.nsIFile);
        file.initWithPath(path);
        if (!file.exists()) {
            win.alert("File " + path + " does not exist.");
            return;
        }
        var file_stream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                .createInstance(Components.interfaces.nsIFileInputStream);
        cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
                .createInstance(Components.interfaces.nsIConverterInputStream);
        file_stream.init(file, -1, 0, 0);
        cstream.init(file_stream, "UTF-8", 1024, 0xFFFD);
        cstream.QueryInterface(Components.interfaces.nsIUnicharLineInputStream);
        return cstream;
    },

    fileBackup : function(path) {
        var oldfile = Components.classes["@mozilla.org/file/local;1"]
                .createInstance(Components.interfaces.nsIFile);
        oldfile.initWithPath(path);

        var file = Components.classes["@mozilla.org/file/local;1"]
                .createInstance(Components.interfaces.nsIFile);
        file.initWithPath(path + ".lyz~");
        if (file.exists()) {
            file.remove(1);
        }
        // make new backup
        oldfile.copyTo(null, oldfile.leafName + ".lyz~");
        return path + ".lyz~";
    },

    fileWrite : function(path) {
        var win = this.wm.getMostRecentWindow("navigator:browser");
        var file = Components.classes["@mozilla.org/file/local;1"]
                .createInstance(Components.interfaces.nsIFile);
        file.initWithPath(path);
        var file_stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                .createInstance(Components.interfaces.nsIFileOutputStream);

        file_stream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);// write , truncate
        //this comes from Zotero's translate.js
        var cstream = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                .createInstance(Components.interfaces.nsIConverterOutputStream);
        cstream.init(file_stream, "UTF-8", 0, 0);//1024, "?".charCodeAt(0));
        file_stream.write("\xEF\xBB\xBF", "\xEF\xBB\xBF".length);
        return [ file_stream, cstream ];
    },

    // This function appears to be unused
    // loadTranslators : function() {
    //  _cache = [];
    //  _translators = {};
    //  
    //  var i = 0;
    //  var filesInCache = {};
    //  var contents = Zotero.getTranslatorsDirectory().directoryEntries;
    //  while (contents.hasMoreElements()) {
    //      var file = contents.getNext().QueryInterface(
    //              Components.interfaces.nsIFile);
    //      var leafName = file.leafName;
    //      if (!leafName || leafName[0] == ".")
    //          continue;
    //      var lastModifiedTime = file.lastModifiedTime;
    //
    //      var dbCacheEntry = false;
    //      if (dbCache[leafName]) {
    //          filesInCache[leafName] = true;
    //          if (dbCache[leafName].lastModifiedTime == lastModifiedTime) {
    //              dbCacheEntry = dbCache[file.leafName];
    //          }
    //      }
    //
    //      if (dbCacheEntry) {
    //          // get JSON from cache if possible
    //          var translator = new Zotero.Translator(file,
    //                  dbCacheEntry.translatorJSON, dbCacheEntry.code);
    //          filesInCache[leafName] = true;
    //      } else {
    //          // otherwise, load from file
    //          var translator = new Zotero.Translator(file);
    //      }
    //
    //      if (translator.translatorID) {
    //          if (_translators[translator.translatorID]) {
    //              // same translator is already cached
    //              translator
    //                      .logError('Translator with ID '
    //                              + translator.translatorID
    //                              + ' already loaded from "'
    //                              + _translators[translator.translatorID].file.leafName
    //                              + '"');
    //          } else {
    //              // add to cache
    //              _translators[translator.translatorID] = translator;
    //              for ( var type in TRANSLATOR_TYPES) {
    //                  if (translator.translatorType & TRANSLATOR_TYPES[type]) {
    //                      _cache[type].push(translator);
    //                  }
    //              }
    //
    //              if (!dbCacheEntry) {
    //                  // Add cache misses to DB
    //                  if (!transactionStarted) {
    //                      transactionStarted = true;
    //                      Zotero.DB.beginTransaction();
    //                  }
    //                  Zotero.Translators.cacheInDB(leafName,
    //                          translator.metadataString,
    //                          translator.cacheCode ? translator.code : null,
    //                          lastModifiedTime);
    //                  delete translator.metadataString;
    //              }
    //          }
    //      }
    //
    //      i++;
    //  }
    // },

    kile : function() {
        // based on file - allow loading
        // keep in keys
        // insert-citation
        // when kile: disable all LyX functions
    },

    test : function() {
        if (this.lyzDisableCheck()) {
            return
        }
        var win = this.wm.getMostRecentWindow("navigator:browser");
        var t = prompt("Command", "server-get-filename");
        if (!t) {
            win.alert("Error: " + t);
            return;
        }
        //  this.lyxAskServer(t);
        try {
            if (this.os == "Win"){
                t = this.lyxAskServer(t);
            } else {
                t = this._lyxAskServer(t);
            }
            win.alert("RESPONSE: " + t);
        } catch (e) {
            win.alert("Error connecting to lyxserver...\n" + e +
                      "\nTry again.");
        }
        win.alert("DONE");
    },

    pause : function(milliseconds) {
        var dt = new Date();
        while ((new Date()) - dt <= milliseconds) { /* Do nothing */
        }
    },

    checkDocInDB: Zotero.Promise.coroutine(function*() {
        var doc, res;
        var win = this.wm.getMostRecentWindow("navigator:browser");
        doc = this.lyxGetDoc();
        if (!doc) {
            win.alert("Could not retrieve document name.");
            return null;
        }
        res = yield this.DB.queryAsync("SELECT doc,bib FROM docs WHERE doc = ?",[doc]);
        if (res.length === 0) {
            return [ res, doc ];
        }
        return [res[0].bib, doc];
    }),

    addNewDocument: Zotero.Promise.coroutine(function*(doc, bib) {
        yield this.DB.queryAsync("INSERT INTO docs (doc,bib) VALUES(?,?)",[doc,bib]);
    }),

    exportToBibtex: Zotero.Promise.coroutine(function*(items, bib, zids) {
        // returns hash {id:[citekey,text]}
        var win = this.wm.getMostRecentWindow("navigator:browser");
        var text;

        var callback = function(obj, worked) {
            // FIXME: the Zotero API has changed from obj.output
            text = obj.string;//.replace(/\r\n/g, "\n");// this is for Zotero 2.1
            if (!text) {// this is for Zotero 2.0.9
                text = obj.output.replace(/\r\n/g, "\n");
            }
        };

        var translation = new Zotero.Translate.Export;
        var translatorID = this.prefs.getCharPref("selectedTranslator");
        translation.setTranslator(translatorID);
        translation.setHandler("done", callback);
        
        if (this.prefs.getBoolPref("use_utf8")){
            translation.setDisplayOptions({"exportCharset" : "UTF-8"});
        } else {
            translation.setDisplayOptions({"exportCharset" : "escape"});
        }
        if (this.prefs.getBoolPref("useJournalAbbreviation")){
            translation.setDisplayOptions({"useJournalAbbreviation" : "True"});
        }

        var tmp = [];
        var newCitekeys = []
        for ( var i = 0; i < items.length; i++) {
            // TODO: change to libraryKey
            var id = Zotero.Items.getLibraryKeyHash(items[i]);
            translation.setItems([ items[i] ]);
            // XXX: Not setting value of text
            yield translation.translate();
            var ct;
            var itemOK = true;
            if (this.prefs.getBoolPref("createCiteKey")===true){
                // Workaround entries that have been deleted and added again to Zotero, which means they will have 
                // new zotero id and we can't identify them. 
                // try {
                    ct = yield this.createCiteKey(id, text, bib, items[i].key, newCitekeys);
                    newCitekeys.push(ct[0])
                    /*
                } catch(e){
                    
                    var res = yield this.DB.queryAsync("SELECT key FROM keys WHERE zid=?",[id]);
                    win.alert("There is problem with one the entries:\nZotero ID: "+id+"\nBibTeX Key: "+res[0].key+
                            "\nThis item will be deleted from Lyz database because it has been removed from Zotero.\n"+
                            "You might have had duplicate items or you added same item after you have deleted from Zotero.\n\n"+
                            "If you are able to identify the item by the BibTeX key, please cite it again after the Update has finished.\n"+
                            "If you are unable to identify the item by the BibTeX key, you have to identify it in LyX document and cite it again."
                            );
                    yield this.DB.queryAsync("DELETE FROM keys WHERE zid=?",[id]);
                    itemOK = false;
                }*/
            } else {
                var ckre = /.*@[a-z]+\{([^,]+),{1}/;
                var key = ckre.exec(text)[1];
                ct = [key, text];
            }
            if (itemOK) tmp[id] = [ ct[0], ct[1] ];
        }

        return tmp;
    }),

    createCiteKey: Zotero.Promise.coroutine(function*(id, text, bib, obj_key, keyBlacklist) {
        var win = this.wm.getMostRecentWindow("navigator:browser");
        var ckre = /.*@[a-z]+\{([^,]+),{1}/;
        // TODO if item has been deleted from Zotero and added again it will have a new key
        // basically now way to know.
        var oldkey = ckre.exec(text)[1];
        var dic = [];
        // current format is 0_XXXXXXX where 0 is "library id", not sure what that is for
        dic.zotero = id;
        var citekey;
        if (this.prefs.getCharPref("citekey") == "zotero") {
            citekey = id;
            text = text.replace(oldkey, citekey);
            return [ citekey, text ];
        }
        
        else if (this.prefs.getCharPref("citekey") == "zoteroShort"){
            citekey = obj_key;
            text = text.replace(oldkey,citekey);
            return [citekey,text];
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
        citekey = "";

        // NAME
        ckre = /author\s?=\s?\{(.*)\},?\n/;
        creators = ckre.exec(text);
        if (!creators) {
            ckre = /editor\s?=\s?\{(.*)\},?\n/;
            creators = ckre.exec(text);
        }
        try {
            authors = creators[1];
        } catch (e) {
            authors = null;
        }

        var non_latin;
        if (authors) {
            if (authors.split(" and ").length > 1) {
                author = authors.split(" and ")[0].split(",");
                author = author[0].toLowerCase();
            } else {
                author = authors.split(",");
                author = author[0].toLowerCase();
            }
            // check for non-latin names
            if (author[0].charCodeAt() > 7929) {
                non_latin = true;
                author = author.toSource().split("\\u")[1];
            }
            
            var tmp = "";
            for ( var i in author) {
                if (author[i] in lyz_charmap)
                    tmp += lyz_charmap[author[i]];
                else
                    tmp += author[i];
            }
            author = tmp;

        } else {
            author = "";
        }

        dic.author = author;

        // TITLE
        if (non_latin) {
            title = "";
        } else {
            ckre = /title = \{(.*)\},\n/;
            t = ckre.exec(text)[1].toLowerCase();
            t = t.replace(/[^a-z0-9\s]/g, "");
            t = t.split(" ");
            t.reverse();
            title = t.pop();
            // the if statement is there because of short titles, e.g. Ema
            if (title < 6) {// the, a, on, about
                if (t.length > 0)
                    title += t.pop();
            }
            if (title.length < 7) {
                if (t.length > 0)
                    title += t.pop();
            }
        }
        dic.title = title;
        // YEAR
        ckre = /[\s,]+(year|date)\s*=\s*\{\D*(\d+)[^\}]*\},?/; //.*year\s?=\s?\{(.*)\},?/;
        try {
            year = ckre.exec(text)[2].replace(" ", "");
        } catch (e) {
            //win.alert("All entries should to be dated. Please add a date to:\n"+text);
            year = "";
        }
        dic.year = year;
        // custom cite key
        p = this.prefs.getCharPref("citekey").split(" ");
        for ( var i = 0; i < p.length; i++) {
            if (p[i] in dic) {
                citekey += dic[p[i]];
            } else
                citekey += p[i];
        }

        var re = /\\.\{/g;
        citekey = citekey.replace(re, "");
        re = /[^a-z0-9\!\$\&\*\+\-\.\/\:\;\<\>\?\[\]\^\_\`\|]+/g;
        citekey = citekey.replace(re, "");
        //check if cite key exists
        var testKey = citekey
        var count = 1
        while (true) {
            count = count + 1
            if (keyBlacklist.indexOf(testKey) != -1) {
                testKey = citekey + count
                continue
            } else {
                var res = yield this.DB.queryAsync("SELECT key,zid FROM keys WHERE bib=? AND key=? AND zid<>?",[bib,testKey,id]);
                if (res.length > 0) {
                    testKey = citekey + count
                    continue
                } else {
                    citekey = testKey
                    break
                }
            }
        }
        text = text.replace(oldkey, citekey);
        return [ citekey, text ];
    }),

    checkAndCite: Zotero.Promise.coroutine(function*() {
        if (this.lyzDisableCheck()) {
            return
        }
        // export citation to Bibtex
        var win = this.wm.getMostRecentWindow("navigator:browser");
        var zitems = win.ZoteroPane.getSelectedItems();
//      ///////
//      //var key = zitems[0].key;
//      win.alert(zitems[0].key);
//      var key = "0_MQP2MZSJ";
//      var item = this.getZoteroItem(key);
//      win.alert(item.firstCreator);
//      var items = new Array();
//      items.push(item);
//      
//      var text;
//
//      var callback = function(obj, worked) {
//          // FIXME: the Zotero API has changed from obj.output
//          text = obj.string;//.replace(/\r\n/g, "\n");// this is for Zotero 2.1
//          alert("TEST\n"+worked+text);
//          if (!text) {// this is for Zotero 2.0.9
//              text = obj.output.replace(/\r\n/g, "\n");
//          }
//      };
//
//      var translation = new Zotero.Translate.Export;
//      translation.noWait = true;
//      var translatorID = this.prefs.getCharPref("selectedTranslator");
//      translation.setTranslator(translatorID);
//      translation.setHandler("done", callback);
//      
//
//      translation.setItems([item]);
//      translation.translate();
//      win.alert("UPDATE\n"+text);
//      a
//      ///////
        // FIXME: this should be called bellow, but it returns empty there (???)
        if (!zitems.length) {
            win.alert("Please select at least one citation.");
            return;
        }
        // check document name
        var res = yield this.checkDocInDB();
        var bib = res[0];
        var doc = res[1];
        var bib_file;
        var items;
        var keys;
        var entries_text = "";
        var citekey;
        var text;
        if (bib.length === 0) {
            t = "Press OK to create new BibTeX database.\n";
            t += "Press Cancel to select from your existing databases\n";

            // FIXME: the buttons don't show correctly, STD_YES_NO_BUTTONS doesn't work
            // var check = { value: true };
            // var ifps = Components.interfaces.nsIPromptService;
            // var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService();
            // promptService = promptService.QueryInterface(ifps);
            // var res = confirm(t,"BibTex databse selection",
            //            ifps.STD_YES_NO_BUTTONS,null,null,null,"",check);
            res = win.confirm(t, "BibTex database selection");
            if (res) {
                bib_file = this.dialog_FilePickerSave(win,
                        "Select Bibtex file for " + doc, "Bibtex", "*.bib");
                if (!bib_file)
                    return;

            } else {
                bib_file = this.dialog_FilePickerOpen(win,
                        "Select Bibtex file for " + doc, "Bibtex", "*.bib");
                if (!bib_file)
                    return;
            }

            bib = bib_file.path;
            if (bib_file)
                yield this.addNewDocument(doc, bib);
            else
                return;//file dialog canceled
        }
        items = yield this.exportToBibtex(zitems, bib);
        keys = [];
        var zids = [];

        for ( var zid in items) {
            citekey = items[zid][0];
            text = items[zid][1];
            keys.push(citekey);
            //check database, if not in, append to entries_text
            //single key can be associated with several bibtex files
            res = yield this.DB.queryAsync("SELECT key FROM keys WHERE bib=? AND zid=?",[bib,zid]);

            if (res.length === 0) {
                yield this.DB.queryAsync("INSERT INTO keys VALUES(null,?,?,?)",[citekey,bib,zid]);
                zids.push(zid);
                entries_text += text;
            } else if (res[0].key != citekey) {
                var ask = win
                        .confirm(
                                "Zotero record has been changed.\n" +
                                "Press OK to run 'Update BibTeX' and insert the citation.\n" +
                                "Press Cancel to refrain from any action.",
                                "Zotero record changed!");
                if (ask) {
                    // FIXME: started to act weird
                    var xy = this.lyxGetPos();
                    this.updateBibtexAll();
                    if (this.os == "Win"){
                        this.lyxAskServer("server-set-xy:" + xy);
                    } else {
                        this._lyxAskServer("server-set-xy:" + xy);
                    }
                } else {
                    return;
                }
            }
        }
        if (!entries_text == "") {
            this.writeBib(bib, entries_text, zids);
        }
        
        if (this.os == "Win"){
            res = this.lyxAskServer("citation-insert:" + keys.join(","));
        } else {
            res = this._lyxAskServer("citation-insert:" + keys.join(","));
        }
    }),

    updateBibtexAll: Zotero.Promise.coroutine(function*() {
        if (this.lyzDisableCheck()) {
            return
        }
        //first update from the bibtex file
        
        yield this.updateFromBibtexFile();
        // update when zotero items are modified
        var win = this.wm.getMostRecentWindow("navigator:browser");
        var res = yield this.checkDocInDB();
        var doc = res[1];
        var bib = res[0];
        if (!bib) {
            win.alert("There is no BibTeX database associated with the active LyX document: " +
                      doc);
            return;
        }
        var citekey = this.prefs.getCharPref("citekey");

        
        var p = win.confirm("You are going to update BibTeX database:\n\n" +
                            bib + "\n\nCurrent BibTex key format \"" + citekey +
                            "\" will be used.\nDo you want to continue?");
        if (p) {
            // get all ids for the bibtex file
            var ids_h = yield this.DB.queryAsync("SELECT zid,key FROM keys WHERE bib=? GROUP BY zid",[bib]);
            var ids = [];
            var zids = [];
            var oldkeys = [];
            var zid;
            for ( var i = 0; i < ids_h.length; i++) {
                zid = ids_h[i].zid;
                var item = this.getZoteroItem(zid);
                ids.push(item);
                zids.push(zid);
                oldkeys[ids_h[i].key] = zid;
            }

            var ex = yield this.exportToBibtex(ids, bib, zids);
            zids = [];
            var newkeys = [];
            var text = "";
            for ( var id in ex) {
                text += ex[id][1];
                zids.push(id);
                newkeys[id] = ex[id][0];
            }
            if (!(oldkeys.length == newkeys.length)) {
                win.alert("Aborting");
                return;
            }
            this.replace = true;

            // now is time to update db, bibtex and lyx
            for ( zid in newkeys) {
                yield this.DB.queryAsync("UPDATE keys SET key=? WHERE zid=? AND bib=?",[newkeys[zid],zid,bib]);
            }
            this.writeBib(bib, text, zids);
            res = win
                    .confirm("Your BibTeX database " + bib +
                             " has been updated.\n" +
                             "Do you also want to update the associated LyX documents?\n" +
                             "This is only necessary when any author, title or year has been modified,\n" +
                             "or when the BibTex key format has been changed.");
            if (!res)
                return;
            // FIXME test again updating of all document associated with current bib
            // var tmp = this.DB.query("SELECT doc FROM docs where bib=\""+bib+"\"");       
            // if (tmp.length==1){
            
            if (this.os == "Win"){
                this.lyxAskServer("buffer-write");
                this.lyxAskServer("buffer-close");
            } else {
                this._lyxAskServer("buffer-write");
                this._lyxAskServer("buffer-close");
            }
            
            this.syncBibtexKeyFormat(doc, oldkeys, newkeys);
            if (this.os == "Win"){
                this.lyxAskServer("file-open:" + doc);
            } else {
                this._lyxAskServer("file-open:" + doc);
            }
            
            // } else {
            //  var docs = new Array();
            //  var open_docs = this.lyxGetOpenDocs();
            //     this.pause(100);
            //  this.lyxPipeWrite("buffer-write-all");
            //  for (var i=0;i<open_docs.length;i++){
            //         this.pause(100);
            //      this.lyxPipeWrite("buffer-close");
            //  }
            //  for (var k=0;k<tmp.length;k++){
            //      var d = tmp[k]['doc'];
            //      this.syncBibtexKeyFormat(d,oldkeys,newkeys);
            //  }

            //  for (var j=0;j<open_docs.length;j++){
            //         this.pause(100);
            //      this.lyxPipeWrite("file-open:"+open_docs[j]);
            //  }
            // }   
        }//end of if (p)
    }),

    updateFromBibtexFile: Zotero.Promise.coroutine(function*() {
        var win = this.wm.getMostRecentWindow("navigator:browser");
        var res = yield this.checkDocInDB();
        var doc = res[1];
        var bib = res[0];
        if (!bib) {
            win.alert("There is no BibTeX database associated with the active LyX document: "+ doc);
            return;
        }
        var cstream = this.fileReadByLine(bib);
        var line = {};
        cstream.readLine(line); // read the whole file and put it in str.value
        line = line.value;
        cstream.close();
        var ar = line.trim().split(" ");
        var info = 0;
        for ( var i = 0; i < ar.length; i++) {
            var zid = ar[i];
            res = yield this.DB.queryAsync("SELECT * FROM keys WHERE zid=? AND bib=?",[zid,bib]);

            if (res.length === 0) {
                /*info += zid + ": "
                        + this.exportToBibliography(this.getZoteroItem(zid))
                        + "\n";
                        */
                info+=1;
                // key=zid is not right, but it will be updated when updateBibtex is run
                yield this.DB.queryAsync("INSERT INTO keys VALUES(null,?,?,?)",[zid,bib,zid]);
            }
        }
        if (info > 0)
            win.alert(info + " item(s) changed or added.");
    }),

    dbDeleteBib: Zotero.Promise.coroutine(function*() {
        if (this.lyzDisableCheck()) {
            return
        }
        var win = this.wm.getMostRecentWindow("navigator:browser");
        var dic = yield this.DB.queryAsync("SELECT bib FROM keys GROUP BY bib");
        var params = {
            inn : {
                items : dic,
                type : "bib"
            },
            out : null
        };
        var res = win.openDialog("chrome://lyz/content/select.xul", "",
                "chrome, dialog, modal, centerscreen, resizable=yes", params);
        if (!params.out)
            return;
        var bib;
        if (params.out) {
            bib = params.out.item;
        }
        res = win.confirm("You are about to delete record of BibTeX database:\n" +
                          bib +
                          "\nRecord about associated documents will also be deleted.\n",
                          "Deleting LyZ database record");
        if (!res)
            return;
        yield this.DB.queryAsync("DELETE FROM docs WHERE bib=?",[bib]);
        yield this.DB.queryAsync("DELETE FROM keys WHERE bib=?",[bib]);
    }),

    dbDeleteDoc: Zotero.Promise.coroutine(function*(doc, bib) {
        if (this.lyzDisableCheck()) {
            return
        }
        var win = this.wm.getMostRecentWindow("navigator:browser");
        var dic = yield this.DB.queryAsync("SELECT doc FROM docs");
        var params = {
            inn : {
                items : dic,
                type : "doc"
            },
            out : null
        };
        var res = win.openDialog("chrome://lyz/content/select.xul", "",
                "chrome, dialog, modal, centerscreen, resizable=yes", params);
        if (!params.out)
            return;

        if (params.out) {
            doc = params.out.item;
        }
        res = win.confirm("Do you really want to delete the LyZ database record of the document\n" +
                          doc + "?");
        if (!res)
            return;
        yield this.DB.queryAsync("DELETE FROM docs WHERE doc=?",[doc]);
    }),

    dbRenameDoc: Zotero.Promise.coroutine(function*() {
        if (this.lyzDisableCheck()) {
            return
        }
        var win = this.wm.getMostRecentWindow("navigator:browser");
        var dic = yield this.DB.queryAsync("SELECT id,doc FROM docs");
        var params = {
            inn : {
                items : dic,
                type : "doc"
            },
            out : null
        };
        var res = win.openDialog("chrome://lyz/content/select.xul", "",
                "chrome, dialog, modal, centerscreen, resizable=yes", params);
        if (!params.out)
            return;
        var doc;
        if (params.out) {
            doc = params.out.item;
        }
        var newfname = this.dialog_FilePickerOpen(win,
                "Select LyX document for " + doc, "LyX", "*.lyx").path;
        // have to replace \ with / on windows because lyxserver returns unix style paths
        newfname = newfname.replace(/\\/g, "/");
        if (!newfname)
            return;
        yield this.DB.queryAsync("UPDATE docs SET doc=? WHERE doc=?",[newfname,doc]);
    }),

    dbRenameDoc: Zotero.Promise.coroutine(function*() {
        if (this.lyzDisableCheck()) {
            return
        }
        var win = this.wm.getMostRecentWindow("navigator:browser");
        var dic = yield this.DB.queryAsync("SELECT id,doc FROM docs");
        var params = {
            inn : {
                items : dic,
                type : "doc"
            },
            out : null
        };
        var res = win.openDialog("chrome://lyz/content/select.xul", "",
                "chrome, dialog, modal, centerscreen, resizable=yes", params);
        if (!params.out)
            return;
        var doc;
        if (params.out) {
            doc = params.out.item;
        }
        var newfname = this.dialog_FilePickerOpen(win,
                "Select LyX document for " + doc, "LyX", "*.lyx").path;
        // have to replace \ with / on windows because lyxserver returns unix style paths
        newfname = newfname.replace(/\\/g, "/");
        if (!newfname)
            return;
        yield this.DB.queryAsync("UPDATE docs SET doc=? WHERE doc=?",[newfname,doc]);
    }),

    dbRenameBib: Zotero.Promise.coroutine(function*() {
        var win = this.wm.getMostRecentWindow("navigator:browser");
        var dic = yield this.DB.queryAsync("SELECT DISTINCT bib FROM docs");
        var params = {
            inn : {
                items : dic,
                type : "bib"
            },
            out : null
        };
        var res = win.openDialog("chrome://lyz/content/select.xul", "",
                "chrome, dialog, modal, centerscreen, resizable=yes", params);
        if (!params.out)
            return;
        var bib;
        if (params.out) {
            bib = params.out.item;
        }
        newfname = this.dialog_FilePickerOpen(win, "Select Bibtex file for " +
                                              bib, "Bibtex", "*.bib").path;
        if (!newfname)
            return;
        yield this.DB.queryAsync("UPDATE docs SET bib=? WHERE bib=?",[newfname,bib]);
        yield this.DB.queryAsync("UPDATE keys SET bib=? WHERE bib=?",[newfname,bib]);
    }),

    shutdown: Zotero.Promise.coroutine(function*() {
        yield Zotero.Lyz.DB.closeDatabase(true)
    }),

    migrateToZotero5: Zotero.Promise.coroutine(function*(context) {
        yield Zotero.uiReadyPromise
        if (Zotero.Libraries.userLibraryID === 0) {
            this.prefs.setBoolPref('checkZotero5Migration', false)
            return
        }
        res = yield this.DB.queryAsync("SELECT key FROM keys WHERE zid GLOB '0_*'")
        if (res.length === 0) {
            this.prefs.setBoolPref('checkZotero5Migration', false)
            return
        }

        var prompts = Components.
            classes['@mozilla.org/embedcomp/prompt-service;1'].
            getService(Components.interfaces.nsIPromptService)

        var doNotShow = { value: false }
        var pressedOK = prompts.confirmCheck(
            null,
            'LyZ: legacy database detected',
            'LyZ has detected Zotero 4.0 entries in its database. These entries will prevent LyZ ' +
                'from creating a .bib file. Do you want LyZ to try to update the ' +
                'entries to match Zotero 5 items? Consider backing up your Zotero data directory ' +
                'before doing so. It can be accessed from the "Files and Folders" in the ' +
                'Advanced section of Zotero\'s preferences. Some cite keys may change during ' +
                'this process.',
            'Do not show this prompt in the future',
            doNotShow)
        var win = this.wm.getMostRecentWindow("navigator:browser");
        if (!pressedOK) {
            if (doNotShow.value === true) {
                win.alert('To show this dialog again in the future, reset ' +
                          'extensions.lyz.checkZotero5Migration in the config editor available ' +
                          'in Zotero\'s Advanced preferences section.')
                this.prefs.setBoolPref('checkZotero5Migration', false)
            }
            return
        } else {
            win.alert('LyZ database migration will begin now. Do not exit Zotero until Lyz ' +
                      'indicates that the migration is complete.')
        }

        var results = yield this.DB.queryAsync("SELECT key,bib,zid FROM keys WHERE zid GLOB '0_*'")
        var newZid, conflicts, finalKey, tmpDroppedKeys
        var droppedKeys = []
        for (let idx = 0; idx < results.length; idx++) {
            newZid = String(Zotero.Libraries.userLibraryID) + results[idx].zid.slice(1)
            finalKey = results[idx].key
            conflicts = yield this.DB.queryAsync("SELECT key FROM keys WHERE zid=? AND bib=?",
                                                 [newZid, results[idx].bib])
            if (conflicts.length > 0) {
                tmpDroppedKeys = []
                for (let jdx = 0; jdx < conflicts.length; jdx++) {
                    if (finalKey > conflicts[jdx].key) {
                        tmpDroppedKeys.push(finalKey)
                        finalKey = conflicts[jdx].key
                    } else {
                        tmpDroppedKeys.push(conflicts[jdx].key)
                    }
                }
                yield this.DB.queryAsync("DELETE FROM keys WHERE zid=? AND bib=?",
                                         [newZid, results[idx].bib])
                for (let jdx = 0; jdx < tmpDroppedKeys.length; jdx++) {
                    droppedKeys.push([results[idx].bib, tmpDroppedKeys[jdx], finalKey])
                }
            }
            yield this.DB.queryAsync("UPDATE keys SET zid=?, key=? WHERE zid=? AND key=? AND bib=?",
                                     [newZid, finalKey, results[idx].zid, results[idx].key,
                                      results[idx].bib])
        }

        this.prefs.setBoolPref('checkZotero5Migration', false)
        if (droppedKeys.length > 0) {
            var report = 'Document,Old key,New key\r\n' + droppedKeys.join('\r\n')

            var reportPath = OS.Path.join(Zotero.DataDirectory.dir, 'lyz_migration.csv')
            var fbibtex_stream, cstream
            [ fbibtex_stream, cstream ] = this.fileWrite(reportPath)
            cstream.writeString(report)
            cstream.close()
            fbibtex_stream.close()

            win = this.wm.getMostRecentWindow("navigator:browser")
            win.openDialog('chrome://lyz/content/migration5.xul', 'lyz-migration-window',
                           'chrome, centerscreen',
                           report)
        } else {
            win = this.wm.getMostRecentWindow("navigator:browser")
            win.alert('Lyz migration complete. No citation keys were changed.')
        }
    })
};


var lyz_charmap = {
    "\u00A0" : "~", // NO-BREAK SPACE
    "\u00A1" : "{\\textexclamdown}", // INVERTED EXCLAMATION MARK
    "\u00A2" : "{\\textcent}", // CENT SIGN
    "\u00A3" : "{\\textsterling}", // POUND SIGN
    "\u00A5" : "{\\textyen}", // YEN SIGN
    "\u00A6" : "{\\textbrokenbar}", // BROKEN BAR
    "\u00A7" : "{\\textsection}", // SECTION SIGN
    "\u00A8" : "{\\textasciidieresis}", // DIAERESIS
    "\u00A9" : "{\\textcopyright}", // COPYRIGHT SIGN
    "\u00AA" : "{\\textordfeminine}", // FEMININE ORDINAL INDICATOR
    "\u00AB" : "{\\guillemotleft}", // LEFT-POINTING DOUBLE ANGLE QUOTATION MARK
    "\u00AC" : "{\\textlnot}", // NOT SIGN
    "\u00AD" : "-", // SOFT HYPHEN
    "\u00AE" : "{\\textregistered}", // REGISTERED SIGN
    "\u00AF" : "{\\textasciimacron}", // MACRON
    "\u00B0" : "{\\textdegree}", // DEGREE SIGN
    "\u00B1" : "{\\textpm}", // PLUS-MINUS SIGN
    "\u00B2" : "{\\texttwosuperior}", // SUPERSCRIPT TWO
    "\u00B3" : "{\\textthreesuperior}", // SUPERSCRIPT THREE
    "\u00B4" : "{\\textasciiacute}", // ACUTE ACCENT
    "\u00B5" : "{\\textmu}", // MICRO SIGN
    "\u00B6" : "{\\textparagraph}", // PILCROW SIGN
    "\u00B7" : "{\\textperiodcentered}", // MIDDLE DOT
    "\u00B8" : "{\\c\\ }", // CEDILLA
    "\u00B9" : "{\\textonesuperior}", // SUPERSCRIPT ONE
    "\u00BA" : "{\\textordmasculine}", // MASCULINE ORDINAL INDICATOR
    "\u00BB" : "{\\guillemotright}", // RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK
    "\u00BC" : "{\\textonequarter}", // VULGAR FRACTION ONE QUARTER
    "\u00BD" : "{\\textonehalf}", // VULGAR FRACTION ONE HALF
    "\u00BE" : "{\\textthreequarters}", // VULGAR FRACTION THREE QUARTERS
    "\u00BF" : "{\\textquestiondown}", // INVERTED QUESTION MARK
    "\u00C6" : "{\\AE}", // LATIN CAPITAL LETTER AE
    "\u00D0" : "{\\DH}", // LATIN CAPITAL LETTER ETH
    "\u00D7" : "{\\texttimes}", // MULTIPLICATION SIGN
    "\u00DE" : "{\\TH}", // LATIN CAPITAL LETTER THORN
    "\u00DF" : "{\\ss}", // LATIN SMALL LETTER SHARP S
    "\u00E6" : "{\\ae}", // LATIN SMALL LETTER AE
    "\u00F0" : "{\\dh}", // LATIN SMALL LETTER ETH
    "\u00F7" : "{\\textdiv}", // DIVISION SIGN
    "\u00FE" : "{\\th}", // LATIN SMALL LETTER THORN
    "\u0131" : "{\\i}", // LATIN SMALL LETTER DOTLESS I
    "\u0132" : "IJ", // LATIN CAPITAL LIGATURE IJ
    "\u0133" : "ij", // LATIN SMALL LIGATURE IJ
    "\u0138" : "k", // LATIN SMALL LETTER KRA
    "\u0149" : "'n", // LATIN SMALL LETTER N PRECEDED BY APOSTROPHE
    "\u014A" : "{\\NG}", // LATIN CAPITAL LETTER ENG
    "\u014B" : "{\\ng}", // LATIN SMALL LETTER ENG
    "\u0152" : "{\\OE}", // LATIN CAPITAL LIGATURE OE
    "\u0153" : "{\\oe}", // LATIN SMALL LIGATURE OE
    "\u017F" : "s", // LATIN SMALL LETTER LONG S
    "\u02B9" : "'", // MODIFIER LETTER PRIME
    "\u02BB" : "'", // MODIFIER LETTER TURNED COMMA
    "\u02BC" : "'", // MODIFIER LETTER APOSTROPHE
    "\u02BD" : "'", // MODIFIER LETTER REVERSED COMMA
    "\u02C6" : "{\\textasciicircum}", // MODIFIER LETTER CIRCUMFLEX ACCENT
    "\u02C8" : "'", // MODIFIER LETTER VERTICAL LINE
    "\u02C9" : "-", // MODIFIER LETTER MACRON
    "\u02CC" : ",", // MODIFIER LETTER LOW VERTICAL LINE
    "\u02D0" : ":", // MODIFIER LETTER TRIANGULAR COLON
    "\u02DA" : "o", // RING ABOVE
    "\u02DC" : "\\~{}", // SMALL TILDE
    "\u02DD" : "{\\textacutedbl}", // DOUBLE ACUTE ACCENT
    "\u0374" : "'", // GREEK NUMERAL SIGN
    "\u0375" : ",", // GREEK LOWER NUMERAL SIGN
    "\u037E" : ";", // GREEK QUESTION MARK
    "\u2000" : " ", // EN QUAD
    "\u2001" : "  ", // EM QUAD
    "\u2002" : " ", // EN SPACE
    "\u2003" : "  ", // EM SPACE
    "\u2004" : " ", // THREE-PER-EM SPACE
    "\u2005" : " ", // FOUR-PER-EM SPACE
    "\u2006" : " ", // SIX-PER-EM SPACE
    "\u2007" : " ", // FIGURE SPACE
    "\u2008" : " ", // PUNCTUATION SPACE
    "\u2009" : " ", // THIN SPACE
    "\u2010" : "-", // HYPHEN
    "\u2011" : "-", // NON-BREAKING HYPHEN
    "\u2012" : "-", // FIGURE DASH
    "\u2013" : "{\\textendash}", // EN DASH
    "\u2014" : "{\\textemdash}", // EM DASH
    "\u2015" : "{\\textemdash}", // HORIZONTAL BAR or QUOTATION DASH (not in LaTeX -- use EM DASH)
    "\u2016" : "{\\textbardbl}", // DOUBLE VERTICAL LINE
    "\u2017" : "{\\textunderscore}", // DOUBLE LOW LINE
    "\u2018" : "{\\textquoteleft}", // LEFT SINGLE QUOTATION MARK
    "\u2019" : "{\\textquoteright}", // RIGHT SINGLE QUOTATION MARK
    "\u201A" : "{\\quotesinglbase}", // SINGLE LOW-9 QUOTATION MARK
    "\u201B" : "'", // SINGLE HIGH-REVERSED-9 QUOTATION MARK
    "\u201C" : "{\\textquotedblleft}", // LEFT DOUBLE QUOTATION MARK
    "\u201D" : "{\\textquotedblright}", // RIGHT DOUBLE QUOTATION MARK
    "\u201E" : "{\\quotedblbase}", // DOUBLE LOW-9 QUOTATION MARK
    "\u201F" : "{\\quotedblbase}", // DOUBLE HIGH-REVERSED-9 QUOTATION MARK
    "\u2020" : "{\\textdagger}", // DAGGER
    "\u2021" : "{\\textdaggerdbl}", // DOUBLE DAGGER
    "\u2022" : "{\\textbullet}", // BULLET
    "\u2023" : ">", // TRIANGULAR BULLET
    "\u2024" : ".", // ONE DOT LEADER
    "\u2025" : "..", // TWO DOT LEADER
    "\u2026" : "{\\textellipsis}", // HORIZONTAL ELLIPSIS
    "\u2027" : "-", // HYPHENATION POINT
    "\u202F" : " ", // NARROW NO-BREAK SPACE
    "\u2030" : "{\\textperthousand}", // PER MILLE SIGN
    "\u2032" : "'", // PRIME
    "\u2033" : "'", // DOUBLE PRIME
    "\u2034" : "'''", // TRIPLE PRIME
    "\u2035" : "`", // REVERSED PRIME
    "\u2036" : "``", // REVERSED DOUBLE PRIME
    "\u2037" : "```", // REVERSED TRIPLE PRIME
    "\u2039" : "{\\guilsinglleft}", // SINGLE LEFT-POINTING ANGLE QUOTATION MARK
    "\u203A" : "{\\guilsinglright}", // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK
    "\u203C" : "!!", // DOUBLE EXCLAMATION MARK
    "\u203E" : "-", // OVERLINE
    "\u2043" : "-", // HYPHEN BULLET
    "\u2044" : "{\\textfractionsolidus}", // FRACTION SLASH
    "\u2048" : "?!", // QUESTION EXCLAMATION MARK
    "\u2049" : "!?", // EXCLAMATION QUESTION MARK
    "\u204A" : "7", // TIRONIAN SIGN ET
    "\u2070" : "$^{0}$", // SUPERSCRIPT ZERO
    "\u2074" : "$^{4}$", // SUPERSCRIPT FOUR
    "\u2075" : "$^{5}$", // SUPERSCRIPT FIVE
    "\u2076" : "$^{6}$", // SUPERSCRIPT SIX
    "\u2077" : "$^{7}$", // SUPERSCRIPT SEVEN
    "\u2078" : "$^{8}$", // SUPERSCRIPT EIGHT
    "\u2079" : "$^{9}$", // SUPERSCRIPT NINE
    "\u207A" : "$^{+}$", // SUPERSCRIPT PLUS SIGN
    "\u207B" : "$^{-}$", // SUPERSCRIPT MINUS
    "\u207C" : "$^{=}$", // SUPERSCRIPT EQUALS SIGN
    "\u207D" : "$^{(}$", // SUPERSCRIPT LEFT PARENTHESIS
    "\u207E" : "$^{)}$", // SUPERSCRIPT RIGHT PARENTHESIS
    "\u207F" : "$^{n}$", // SUPERSCRIPT LATIN SMALL LETTER N
    "\u2080" : "$_{0}$", // SUBSCRIPT ZERO
    "\u2081" : "$_{1}$", // SUBSCRIPT ONE
    "\u2082" : "$_{2}$", // SUBSCRIPT TWO
    "\u2083" : "$_{3}$", // SUBSCRIPT THREE
    "\u2084" : "$_{4}$", // SUBSCRIPT FOUR
    "\u2085" : "$_{5}$", // SUBSCRIPT FIVE
    "\u2086" : "$_{6}$", // SUBSCRIPT SIX
    "\u2087" : "$_{7}$", // SUBSCRIPT SEVEN
    "\u2088" : "$_{8}$", // SUBSCRIPT EIGHT
    "\u2089" : "$_{9}$", // SUBSCRIPT NINE
    "\u208A" : "$_{+}$", // SUBSCRIPT PLUS SIGN
    "\u208B" : "$_{-}$", // SUBSCRIPT MINUS
    "\u208C" : "$_{=}$", // SUBSCRIPT EQUALS SIGN
    "\u208D" : "$_{(}$", // SUBSCRIPT LEFT PARENTHESIS
    "\u208E" : "$_{)}$", // SUBSCRIPT RIGHT PARENTHESIS
    "\u20AC" : "{\\texteuro}", // EURO SIGN
    "\u2100" : "a/c", // ACCOUNT OF
    "\u2101" : "a/s", // ADDRESSED TO THE SUBJECT
    "\u2103" : "{\\textcelsius}", // DEGREE CELSIUS
    "\u2105" : "c/o", // CARE OF
    "\u2106" : "c/u", // CADA UNA
    "\u2109" : "F", // DEGREE FAHRENHEIT
    "\u2113" : "l", // SCRIPT SMALL L
    "\u2116" : "{\\textnumero}", // NUMERO SIGN
    "\u2117" : "{\\textcircledP}", // SOUND RECORDING COPYRIGHT
    "\u2120" : "{\\textservicemark}", // SERVICE MARK
    "\u2121" : "TEL", // TELEPHONE SIGN
    "\u2122" : "{\\texttrademark}", // TRADE MARK SIGN
    "\u2126" : "{\\textohm}", // OHM SIGN
    "\u212A" : "K", // KELVIN SIGN
    "\u212B" : "A", // ANGSTROM SIGN
    "\u212E" : "{\\textestimated}", // ESTIMATED SYMBOL
    "\u2153" : " 1/3", // VULGAR FRACTION ONE THIRD
    "\u2154" : " 2/3", // VULGAR FRACTION TWO THIRDS
    "\u2155" : " 1/5", // VULGAR FRACTION ONE FIFTH
    "\u2156" : " 2/5", // VULGAR FRACTION TWO FIFTHS
    "\u2157" : " 3/5", // VULGAR FRACTION THREE FIFTHS
    "\u2158" : " 4/5", // VULGAR FRACTION FOUR FIFTHS
    "\u2159" : " 1/6", // VULGAR FRACTION ONE SIXTH
    "\u215A" : " 5/6", // VULGAR FRACTION FIVE SIXTHS
    "\u215B" : " 1/8", // VULGAR FRACTION ONE EIGHTH
    "\u215C" : " 3/8", // VULGAR FRACTION THREE EIGHTHS
    "\u215D" : " 5/8", // VULGAR FRACTION FIVE EIGHTHS
    "\u215E" : " 7/8", // VULGAR FRACTION SEVEN EIGHTHS
    "\u215F" : " 1/", // FRACTION NUMERATOR ONE
    "\u2160" : "I", // ROMAN NUMERAL ONE
    "\u2161" : "II", // ROMAN NUMERAL TWO
    "\u2162" : "III", // ROMAN NUMERAL THREE
    "\u2163" : "IV", // ROMAN NUMERAL FOUR
    "\u2164" : "V", // ROMAN NUMERAL FIVE
    "\u2165" : "VI", // ROMAN NUMERAL SIX
    "\u2166" : "VII", // ROMAN NUMERAL SEVEN
    "\u2167" : "VIII", // ROMAN NUMERAL EIGHT
    "\u2168" : "IX", // ROMAN NUMERAL NINE
    "\u2169" : "X", // ROMAN NUMERAL TEN
    "\u216A" : "XI", // ROMAN NUMERAL ELEVEN
    "\u216B" : "XII", // ROMAN NUMERAL TWELVE
    "\u216C" : "L", // ROMAN NUMERAL FIFTY
    "\u216D" : "C", // ROMAN NUMERAL ONE HUNDRED
    "\u216E" : "D", // ROMAN NUMERAL FIVE HUNDRED
    "\u216F" : "M", // ROMAN NUMERAL ONE THOUSAND
    "\u2170" : "i", // SMALL ROMAN NUMERAL ONE
    "\u2171" : "ii", // SMALL ROMAN NUMERAL TWO
    "\u2172" : "iii", // SMALL ROMAN NUMERAL THREE
    "\u2173" : "iv", // SMALL ROMAN NUMERAL FOUR
    "\u2174" : "v", // SMALL ROMAN NUMERAL FIVE
    "\u2175" : "vi", // SMALL ROMAN NUMERAL SIX
    "\u2176" : "vii", // SMALL ROMAN NUMERAL SEVEN
    "\u2177" : "viii", // SMALL ROMAN NUMERAL EIGHT
    "\u2178" : "ix", // SMALL ROMAN NUMERAL NINE
    "\u2179" : "x", // SMALL ROMAN NUMERAL TEN
    "\u217A" : "xi", // SMALL ROMAN NUMERAL ELEVEN
    "\u217B" : "xii", // SMALL ROMAN NUMERAL TWELVE
    "\u217C" : "l", // SMALL ROMAN NUMERAL FIFTY
    "\u217D" : "c", // SMALL ROMAN NUMERAL ONE HUNDRED
    "\u217E" : "d", // SMALL ROMAN NUMERAL FIVE HUNDRED
    "\u217F" : "m", // SMALL ROMAN NUMERAL ONE THOUSAND
    "\u2190" : "{\\textleftarrow}", // LEFTWARDS ARROW
    "\u2191" : "{\\textuparrow}", // UPWARDS ARROW
    "\u2192" : "{\\textrightarrow}", // RIGHTWARDS ARROW
    "\u2193" : "{\\textdownarrow}", // DOWNWARDS ARROW
    "\u2194" : "<->", // LEFT RIGHT ARROW
    "\u21D0" : "<=", // LEFTWARDS DOUBLE ARROW
    "\u21D2" : "=>", // RIGHTWARDS DOUBLE ARROW
    "\u21D4" : "<=>", // LEFT RIGHT DOUBLE ARROW
    "\u2212" : "-", // MINUS SIGN
    "\u2215" : "/", // DIVISION SLASH
    "\u2216" : "\\", // SET MINUS
    "\u2217" : "*", // ASTERISK OPERATOR
    "\u2218" : "o", // RING OPERATOR
    "\u2219" : ".", // BULLET OPERATOR
    "\u221E" : "$\\infty$", // INFINITY
    "\u2223" : "|", // DIVIDES
    "\u2225" : "||", // PARALLEL TO
    "\u2236" : ":", // RATIO
    "\u223C" : "\\~{}", // TILDE OPERATOR
    "\u2260" : "/=", // NOT EQUAL TO
    "\u2261" : "=", // IDENTICAL TO
    "\u2264" : "<=", // LESS-THAN OR EQUAL TO
    "\u2265" : ">=", // GREATER-THAN OR EQUAL TO
    "\u226A" : "<<", // MUCH LESS-THAN
    "\u226B" : ">>", // MUCH GREATER-THAN
    "\u2295" : "(+)", // CIRCLED PLUS
    "\u2296" : "(-)", // CIRCLED MINUS
    "\u2297" : "(x)", // CIRCLED TIMES
    //    "\u2298":"(/)", // CIRCLED DIVISION SLASH
    "\u22A2" : "|-", // RIGHT TACK
    "\u22A3" : "-|", // LEFT TACK
    "\u22A6" : "|-", // ASSERTION
    "\u22A7" : "|=", // MODELS
    "\u22A8" : "|=", // TRUE
    "\u22A9" : "||-", // FORCES
    "\u22C5" : ".", // DOT OPERATOR
    "\u22C6" : "*", // STAR OPERATOR
    "\u22D5" : "$\\#$", // EQUAL AND PARALLEL TO
    "\u22D8" : "<<<", // VERY MUCH LESS-THAN
    "\u22D9" : ">>>", // VERY MUCH GREATER-THAN
    "\u2329" : "{\\textlangle}", // LEFT-POINTING ANGLE BRACKET
    "\u232A" : "{\\textrangle}", // RIGHT-POINTING ANGLE BRACKET
    "\u2400" : "NUL", // SYMBOL FOR NULL
    "\u2401" : "SOH", // SYMBOL FOR START OF HEADING
    "\u2402" : "STX", // SYMBOL FOR START OF TEXT
    "\u2403" : "ETX", // SYMBOL FOR END OF TEXT
    "\u2404" : "EOT", // SYMBOL FOR END OF TRANSMISSION
    "\u2405" : "ENQ", // SYMBOL FOR ENQUIRY
    "\u2406" : "ACK", // SYMBOL FOR ACKNOWLEDGE
    "\u2407" : "BEL", // SYMBOL FOR BELL
    "\u2408" : "BS", // SYMBOL FOR BACKSPACE
    "\u2409" : "HT", // SYMBOL FOR HORIZONTAL TABULATION
    "\u240A" : "LF", // SYMBOL FOR LINE FEED
    "\u240B" : "VT", // SYMBOL FOR VERTICAL TABULATION
    "\u240C" : "FF", // SYMBOL FOR FORM FEED
    "\u240D" : "CR", // SYMBOL FOR CARRIAGE RETURN
    "\u240E" : "SO", // SYMBOL FOR SHIFT OUT
    "\u240F" : "SI", // SYMBOL FOR SHIFT IN
    "\u2410" : "DLE", // SYMBOL FOR DATA LINK ESCAPE
    "\u2411" : "DC1", // SYMBOL FOR DEVICE CONTROL ONE
    "\u2412" : "DC2", // SYMBOL FOR DEVICE CONTROL TWO
    "\u2413" : "DC3", // SYMBOL FOR DEVICE CONTROL THREE
    "\u2414" : "DC4", // SYMBOL FOR DEVICE CONTROL FOUR
    "\u2415" : "NAK", // SYMBOL FOR NEGATIVE ACKNOWLEDGE
    "\u2416" : "SYN", // SYMBOL FOR SYNCHRONOUS IDLE
    "\u2417" : "ETB", // SYMBOL FOR END OF TRANSMISSION BLOCK
    "\u2418" : "CAN", // SYMBOL FOR CANCEL
    "\u2419" : "EM", // SYMBOL FOR END OF MEDIUM
    "\u241A" : "SUB", // SYMBOL FOR SUBSTITUTE
    "\u241B" : "ESC", // SYMBOL FOR ESCAPE
    "\u241C" : "FS", // SYMBOL FOR FILE SEPARATOR
    "\u241D" : "GS", // SYMBOL FOR GROUP SEPARATOR
    "\u241E" : "RS", // SYMBOL FOR RECORD SEPARATOR
    "\u241F" : "US", // SYMBOL FOR UNIT SEPARATOR
    "\u2420" : "SP", // SYMBOL FOR SPACE
    "\u2421" : "DEL", // SYMBOL FOR DELETE
    "\u2423" : "{\\textvisiblespace}", // OPEN BOX
    "\u2424" : "NL", // SYMBOL FOR NEWLINE
    "\u2425" : "///", // SYMBOL FOR DELETE FORM TWO
    "\u2426" : "?", // SYMBOL FOR SUBSTITUTE FORM TWO
    "\u2460" : "(1)", // CIRCLED DIGIT ONE
    "\u2461" : "(2)", // CIRCLED DIGIT TWO
    "\u2462" : "(3)", // CIRCLED DIGIT THREE
    "\u2463" : "(4)", // CIRCLED DIGIT FOUR
    "\u2464" : "(5)", // CIRCLED DIGIT FIVE
    "\u2465" : "(6)", // CIRCLED DIGIT SIX
    "\u2466" : "(7)", // CIRCLED DIGIT SEVEN
    "\u2467" : "(8)", // CIRCLED DIGIT EIGHT
    "\u2468" : "(9)", // CIRCLED DIGIT NINE
    "\u2469" : "(10)", // CIRCLED NUMBER TEN
    "\u246A" : "(11)", // CIRCLED NUMBER ELEVEN
    "\u246B" : "(12)", // CIRCLED NUMBER TWELVE
    "\u246C" : "(13)", // CIRCLED NUMBER THIRTEEN
    "\u246D" : "(14)", // CIRCLED NUMBER FOURTEEN
    "\u246E" : "(15)", // CIRCLED NUMBER FIFTEEN
    "\u246F" : "(16)", // CIRCLED NUMBER SIXTEEN
    "\u2470" : "(17)", // CIRCLED NUMBER SEVENTEEN
    "\u2471" : "(18)", // CIRCLED NUMBER EIGHTEEN
    "\u2472" : "(19)", // CIRCLED NUMBER NINETEEN
    "\u2473" : "(20)", // CIRCLED NUMBER TWENTY
    "\u2474" : "(1)", // PARENTHESIZED DIGIT ONE
    "\u2475" : "(2)", // PARENTHESIZED DIGIT TWO
    "\u2476" : "(3)", // PARENTHESIZED DIGIT THREE
    "\u2477" : "(4)", // PARENTHESIZED DIGIT FOUR
    "\u2478" : "(5)", // PARENTHESIZED DIGIT FIVE
    "\u2479" : "(6)", // PARENTHESIZED DIGIT SIX
    "\u247A" : "(7)", // PARENTHESIZED DIGIT SEVEN
    "\u247B" : "(8)", // PARENTHESIZED DIGIT EIGHT
    "\u247C" : "(9)", // PARENTHESIZED DIGIT NINE
    "\u247D" : "(10)", // PARENTHESIZED NUMBER TEN
    "\u247E" : "(11)", // PARENTHESIZED NUMBER ELEVEN
    "\u247F" : "(12)", // PARENTHESIZED NUMBER TWELVE
    "\u2480" : "(13)", // PARENTHESIZED NUMBER THIRTEEN
    "\u2481" : "(14)", // PARENTHESIZED NUMBER FOURTEEN
    "\u2482" : "(15)", // PARENTHESIZED NUMBER FIFTEEN
    "\u2483" : "(16)", // PARENTHESIZED NUMBER SIXTEEN
    "\u2484" : "(17)", // PARENTHESIZED NUMBER SEVENTEEN
    "\u2485" : "(18)", // PARENTHESIZED NUMBER EIGHTEEN
    "\u2486" : "(19)", // PARENTHESIZED NUMBER NINETEEN
    "\u2487" : "(20)", // PARENTHESIZED NUMBER TWENTY
    "\u2488" : "1.", // DIGIT ONE FULL STOP
    "\u2489" : "2.", // DIGIT TWO FULL STOP
    "\u248A" : "3.", // DIGIT THREE FULL STOP
    "\u248B" : "4.", // DIGIT FOUR FULL STOP
    "\u248C" : "5.", // DIGIT FIVE FULL STOP
    "\u248D" : "6.", // DIGIT SIX FULL STOP
    "\u248E" : "7.", // DIGIT SEVEN FULL STOP
    "\u248F" : "8.", // DIGIT EIGHT FULL STOP
    "\u2490" : "9.", // DIGIT NINE FULL STOP
    "\u2491" : "10.", // NUMBER TEN FULL STOP
    "\u2492" : "11.", // NUMBER ELEVEN FULL STOP
    "\u2493" : "12.", // NUMBER TWELVE FULL STOP
    "\u2494" : "13.", // NUMBER THIRTEEN FULL STOP
    "\u2495" : "14.", // NUMBER FOURTEEN FULL STOP
    "\u2496" : "15.", // NUMBER FIFTEEN FULL STOP
    "\u2497" : "16.", // NUMBER SIXTEEN FULL STOP
    "\u2498" : "17.", // NUMBER SEVENTEEN FULL STOP
    "\u2499" : "18.", // NUMBER EIGHTEEN FULL STOP
    "\u249A" : "19.", // NUMBER NINETEEN FULL STOP
    "\u249B" : "20.", // NUMBER TWENTY FULL STOP
    "\u249C" : "(a)", // PARENTHESIZED LATIN SMALL LETTER A
    "\u249D" : "(b)", // PARENTHESIZED LATIN SMALL LETTER B
    "\u249E" : "(c)", // PARENTHESIZED LATIN SMALL LETTER C
    "\u249F" : "(d)", // PARENTHESIZED LATIN SMALL LETTER D
    "\u24A0" : "(e)", // PARENTHESIZED LATIN SMALL LETTER E
    "\u24A1" : "(f)", // PARENTHESIZED LATIN SMALL LETTER F
    "\u24A2" : "(g)", // PARENTHESIZED LATIN SMALL LETTER G
    "\u24A3" : "(h)", // PARENTHESIZED LATIN SMALL LETTER H
    "\u24A4" : "(i)", // PARENTHESIZED LATIN SMALL LETTER I
    "\u24A5" : "(j)", // PARENTHESIZED LATIN SMALL LETTER J
    "\u24A6" : "(k)", // PARENTHESIZED LATIN SMALL LETTER K
    "\u24A7" : "(l)", // PARENTHESIZED LATIN SMALL LETTER L
    "\u24A8" : "(m)", // PARENTHESIZED LATIN SMALL LETTER M
    "\u24A9" : "(n)", // PARENTHESIZED LATIN SMALL LETTER N
    "\u24AA" : "(o)", // PARENTHESIZED LATIN SMALL LETTER O
    "\u24AB" : "(p)", // PARENTHESIZED LATIN SMALL LETTER P
    "\u24AC" : "(q)", // PARENTHESIZED LATIN SMALL LETTER Q
    "\u24AD" : "(r)", // PARENTHESIZED LATIN SMALL LETTER R
    "\u24AE" : "(s)", // PARENTHESIZED LATIN SMALL LETTER S
    "\u24AF" : "(t)", // PARENTHESIZED LATIN SMALL LETTER T
    "\u24B0" : "(u)", // PARENTHESIZED LATIN SMALL LETTER U
    "\u24B1" : "(v)", // PARENTHESIZED LATIN SMALL LETTER V
    "\u24B2" : "(w)", // PARENTHESIZED LATIN SMALL LETTER W
    "\u24B3" : "(x)", // PARENTHESIZED LATIN SMALL LETTER X
    "\u24B4" : "(y)", // PARENTHESIZED LATIN SMALL LETTER Y
    "\u24B5" : "(z)", // PARENTHESIZED LATIN SMALL LETTER Z
    "\u24B6" : "(A)", // CIRCLED LATIN CAPITAL LETTER A
    "\u24B7" : "(B)", // CIRCLED LATIN CAPITAL LETTER B
    "\u24B8" : "(C)", // CIRCLED LATIN CAPITAL LETTER C
    "\u24B9" : "(D)", // CIRCLED LATIN CAPITAL LETTER D
    "\u24BA" : "(E)", // CIRCLED LATIN CAPITAL LETTER E
    "\u24BB" : "(F)", // CIRCLED LATIN CAPITAL LETTER F
    "\u24BC" : "(G)", // CIRCLED LATIN CAPITAL LETTER G
    "\u24BD" : "(H)", // CIRCLED LATIN CAPITAL LETTER H
    "\u24BE" : "(I)", // CIRCLED LATIN CAPITAL LETTER I
    "\u24BF" : "(J)", // CIRCLED LATIN CAPITAL LETTER J
    "\u24C0" : "(K)", // CIRCLED LATIN CAPITAL LETTER K
    "\u24C1" : "(L)", // CIRCLED LATIN CAPITAL LETTER L
    "\u24C2" : "(M)", // CIRCLED LATIN CAPITAL LETTER M
    "\u24C3" : "(N)", // CIRCLED LATIN CAPITAL LETTER N
    "\u24C4" : "(O)", // CIRCLED LATIN CAPITAL LETTER O
    "\u24C5" : "(P)", // CIRCLED LATIN CAPITAL LETTER P
    "\u24C6" : "(Q)", // CIRCLED LATIN CAPITAL LETTER Q
    "\u24C7" : "(R)", // CIRCLED LATIN CAPITAL LETTER R
    "\u24C8" : "(S)", // CIRCLED LATIN CAPITAL LETTER S
    "\u24C9" : "(T)", // CIRCLED LATIN CAPITAL LETTER T
    "\u24CA" : "(U)", // CIRCLED LATIN CAPITAL LETTER U
    "\u24CB" : "(V)", // CIRCLED LATIN CAPITAL LETTER V
    "\u24CC" : "(W)", // CIRCLED LATIN CAPITAL LETTER W
    "\u24CD" : "(X)", // CIRCLED LATIN CAPITAL LETTER X
    "\u24CE" : "(Y)", // CIRCLED LATIN CAPITAL LETTER Y
    "\u24CF" : "(Z)", // CIRCLED LATIN CAPITAL LETTER Z
    "\u24D0" : "(a)", // CIRCLED LATIN SMALL LETTER A
    "\u24D1" : "(b)", // CIRCLED LATIN SMALL LETTER B
    "\u24D2" : "(c)", // CIRCLED LATIN SMALL LETTER C
    "\u24D3" : "(d)", // CIRCLED LATIN SMALL LETTER D
    "\u24D4" : "(e)", // CIRCLED LATIN SMALL LETTER E
    "\u24D5" : "(f)", // CIRCLED LATIN SMALL LETTER F
    "\u24D6" : "(g)", // CIRCLED LATIN SMALL LETTER G
    "\u24D7" : "(h)", // CIRCLED LATIN SMALL LETTER H
    "\u24D8" : "(i)", // CIRCLED LATIN SMALL LETTER I
    "\u24D9" : "(j)", // CIRCLED LATIN SMALL LETTER J
    "\u24DA" : "(k)", // CIRCLED LATIN SMALL LETTER K
    "\u24DB" : "(l)", // CIRCLED LATIN SMALL LETTER L
    "\u24DC" : "(m)", // CIRCLED LATIN SMALL LETTER M
    "\u24DD" : "(n)", // CIRCLED LATIN SMALL LETTER N
    "\u24DE" : "(o)", // CIRCLED LATIN SMALL LETTER O
    "\u24DF" : "(p)", // CIRCLED LATIN SMALL LETTER P
    "\u24E0" : "(q)", // CIRCLED LATIN SMALL LETTER Q
    "\u24E1" : "(r)", // CIRCLED LATIN SMALL LETTER R
    "\u24E2" : "(s)", // CIRCLED LATIN SMALL LETTER S
    "\u24E3" : "(t)", // CIRCLED LATIN SMALL LETTER T
    "\u24E4" : "(u)", // CIRCLED LATIN SMALL LETTER U
    "\u24E5" : "(v)", // CIRCLED LATIN SMALL LETTER V
    "\u24E6" : "(w)", // CIRCLED LATIN SMALL LETTER W
    "\u24E7" : "(x)", // CIRCLED LATIN SMALL LETTER X
    "\u24E8" : "(y)", // CIRCLED LATIN SMALL LETTER Y
    "\u24E9" : "(z)", // CIRCLED LATIN SMALL LETTER Z
    "\u24EA" : "(0)", // CIRCLED DIGIT ZERO
    "\u2500" : "-", // BOX DRAWINGS LIGHT HORIZONTAL
    "\u2501" : "=", // BOX DRAWINGS HEAVY HORIZONTAL
    "\u2502" : "|", // BOX DRAWINGS LIGHT VERTICAL
    "\u2503" : "|", // BOX DRAWINGS HEAVY VERTICAL
    "\u2504" : "-", // BOX DRAWINGS LIGHT TRIPLE DASH HORIZONTAL
    "\u2505" : "=", // BOX DRAWINGS HEAVY TRIPLE DASH HORIZONTAL
    "\u2506" : "|", // BOX DRAWINGS LIGHT TRIPLE DASH VERTICAL
    "\u2507" : "|", // BOX DRAWINGS HEAVY TRIPLE DASH VERTICAL
    "\u2508" : "-", // BOX DRAWINGS LIGHT QUADRUPLE DASH HORIZONTAL
    "\u2509" : "=", // BOX DRAWINGS HEAVY QUADRUPLE DASH HORIZONTAL
    "\u250A" : "|", // BOX DRAWINGS LIGHT QUADRUPLE DASH VERTICAL
    "\u250B" : "|", // BOX DRAWINGS HEAVY QUADRUPLE DASH VERTICAL
    "\u250C" : "+", // BOX DRAWINGS LIGHT DOWN AND RIGHT
    "\u250D" : "+", // BOX DRAWINGS DOWN LIGHT AND RIGHT HEAVY
    "\u250E" : "+", // BOX DRAWINGS DOWN HEAVY AND RIGHT LIGHT
    "\u250F" : "+", // BOX DRAWINGS HEAVY DOWN AND RIGHT
    "\u2510" : "+", // BOX DRAWINGS LIGHT DOWN AND LEFT
    "\u2511" : "+", // BOX DRAWINGS DOWN LIGHT AND LEFT HEAVY
    "\u2512" : "+", // BOX DRAWINGS DOWN HEAVY AND LEFT LIGHT
    "\u2513" : "+", // BOX DRAWINGS HEAVY DOWN AND LEFT
    "\u2514" : "+", // BOX DRAWINGS LIGHT UP AND RIGHT
    "\u2515" : "+", // BOX DRAWINGS UP LIGHT AND RIGHT HEAVY
    "\u2516" : "+", // BOX DRAWINGS UP HEAVY AND RIGHT LIGHT
    "\u2517" : "+", // BOX DRAWINGS HEAVY UP AND RIGHT
    "\u2518" : "+", // BOX DRAWINGS LIGHT UP AND LEFT
    "\u2519" : "+", // BOX DRAWINGS UP LIGHT AND LEFT HEAVY
    "\u251A" : "+", // BOX DRAWINGS UP HEAVY AND LEFT LIGHT
    "\u251B" : "+", // BOX DRAWINGS HEAVY UP AND LEFT
    "\u251C" : "+", // BOX DRAWINGS LIGHT VERTICAL AND RIGHT
    "\u251D" : "+", // BOX DRAWINGS VERTICAL LIGHT AND RIGHT HEAVY
    "\u251E" : "+", // BOX DRAWINGS UP HEAVY AND RIGHT DOWN LIGHT
    "\u251F" : "+", // BOX DRAWINGS DOWN HEAVY AND RIGHT UP LIGHT
    "\u2520" : "+", // BOX DRAWINGS VERTICAL HEAVY AND RIGHT LIGHT
    "\u2521" : "+", // BOX DRAWINGS DOWN LIGHT AND RIGHT UP HEAVY
    "\u2522" : "+", // BOX DRAWINGS UP LIGHT AND RIGHT DOWN HEAVY
    "\u2523" : "+", // BOX DRAWINGS HEAVY VERTICAL AND RIGHT
    "\u2524" : "+", // BOX DRAWINGS LIGHT VERTICAL AND LEFT
    "\u2525" : "+", // BOX DRAWINGS VERTICAL LIGHT AND LEFT HEAVY
    "\u2526" : "+", // BOX DRAWINGS UP HEAVY AND LEFT DOWN LIGHT
    "\u2527" : "+", // BOX DRAWINGS DOWN HEAVY AND LEFT UP LIGHT
    "\u2528" : "+", // BOX DRAWINGS VERTICAL HEAVY AND LEFT LIGHT
    "\u2529" : "+", // BOX DRAWINGS DOWN LIGHT AND LEFT UP HEAVY
    "\u252A" : "+", // BOX DRAWINGS UP LIGHT AND LEFT DOWN HEAVY
    "\u252B" : "+", // BOX DRAWINGS HEAVY VERTICAL AND LEFT
    "\u252C" : "+", // BOX DRAWINGS LIGHT DOWN AND HORIZONTAL
    "\u252D" : "+", // BOX DRAWINGS LEFT HEAVY AND RIGHT DOWN LIGHT
    "\u252E" : "+", // BOX DRAWINGS RIGHT HEAVY AND LEFT DOWN LIGHT
    "\u252F" : "+", // BOX DRAWINGS DOWN LIGHT AND HORIZONTAL HEAVY
    "\u2530" : "+", // BOX DRAWINGS DOWN HEAVY AND HORIZONTAL LIGHT
    "\u2531" : "+", // BOX DRAWINGS RIGHT LIGHT AND LEFT DOWN HEAVY
    "\u2532" : "+", // BOX DRAWINGS LEFT LIGHT AND RIGHT DOWN HEAVY
    "\u2533" : "+", // BOX DRAWINGS HEAVY DOWN AND HORIZONTAL
    "\u2534" : "+", // BOX DRAWINGS LIGHT UP AND HORIZONTAL
    "\u2535" : "+", // BOX DRAWINGS LEFT HEAVY AND RIGHT UP LIGHT
    "\u2536" : "+", // BOX DRAWINGS RIGHT HEAVY AND LEFT UP LIGHT
    "\u2537" : "+", // BOX DRAWINGS UP LIGHT AND HORIZONTAL HEAVY
    "\u2538" : "+", // BOX DRAWINGS UP HEAVY AND HORIZONTAL LIGHT
    "\u2539" : "+", // BOX DRAWINGS RIGHT LIGHT AND LEFT UP HEAVY
    "\u253A" : "+", // BOX DRAWINGS LEFT LIGHT AND RIGHT UP HEAVY
    "\u253B" : "+", // BOX DRAWINGS HEAVY UP AND HORIZONTAL
    "\u253C" : "+", // BOX DRAWINGS LIGHT VERTICAL AND HORIZONTAL
    "\u253D" : "+", // BOX DRAWINGS LEFT HEAVY AND RIGHT VERTICAL LIGHT
    "\u253E" : "+", // BOX DRAWINGS RIGHT HEAVY AND LEFT VERTICAL LIGHT
    "\u253F" : "+", // BOX DRAWINGS VERTICAL LIGHT AND HORIZONTAL HEAVY
    "\u2540" : "+", // BOX DRAWINGS UP HEAVY AND DOWN HORIZONTAL LIGHT
    "\u2541" : "+", // BOX DRAWINGS DOWN HEAVY AND UP HORIZONTAL LIGHT
    "\u2542" : "+", // BOX DRAWINGS VERTICAL HEAVY AND HORIZONTAL LIGHT
    "\u2543" : "+", // BOX DRAWINGS LEFT UP HEAVY AND RIGHT DOWN LIGHT
    "\u2544" : "+", // BOX DRAWINGS RIGHT UP HEAVY AND LEFT DOWN LIGHT
    "\u2545" : "+", // BOX DRAWINGS LEFT DOWN HEAVY AND RIGHT UP LIGHT
    "\u2546" : "+", // BOX DRAWINGS RIGHT DOWN HEAVY AND LEFT UP LIGHT
    "\u2547" : "+", // BOX DRAWINGS DOWN LIGHT AND UP HORIZONTAL HEAVY
    "\u2548" : "+", // BOX DRAWINGS UP LIGHT AND DOWN HORIZONTAL HEAVY
    "\u2549" : "+", // BOX DRAWINGS RIGHT LIGHT AND LEFT VERTICAL HEAVY
    "\u254A" : "+", // BOX DRAWINGS LEFT LIGHT AND RIGHT VERTICAL HEAVY
    "\u254B" : "+", // BOX DRAWINGS HEAVY VERTICAL AND HORIZONTAL
    "\u254C" : "-", // BOX DRAWINGS LIGHT DOUBLE DASH HORIZONTAL
    "\u254D" : "=", // BOX DRAWINGS HEAVY DOUBLE DASH HORIZONTAL
    "\u254E" : "|", // BOX DRAWINGS LIGHT DOUBLE DASH VERTICAL
    "\u254F" : "|", // BOX DRAWINGS HEAVY DOUBLE DASH VERTICAL
    "\u2550" : "=", // BOX DRAWINGS DOUBLE HORIZONTAL
    "\u2551" : "|", // BOX DRAWINGS DOUBLE VERTICAL
    "\u2552" : "+", // BOX DRAWINGS DOWN SINGLE AND RIGHT DOUBLE
    "\u2553" : "+", // BOX DRAWINGS DOWN DOUBLE AND RIGHT SINGLE
    "\u2554" : "+", // BOX DRAWINGS DOUBLE DOWN AND RIGHT
    "\u2555" : "+", // BOX DRAWINGS DOWN SINGLE AND LEFT DOUBLE
    "\u2556" : "+", // BOX DRAWINGS DOWN DOUBLE AND LEFT SINGLE
    "\u2557" : "+", // BOX DRAWINGS DOUBLE DOWN AND LEFT
    "\u2558" : "+", // BOX DRAWINGS UP SINGLE AND RIGHT DOUBLE
    "\u2559" : "+", // BOX DRAWINGS UP DOUBLE AND RIGHT SINGLE
    "\u255A" : "+", // BOX DRAWINGS DOUBLE UP AND RIGHT
    "\u255B" : "+", // BOX DRAWINGS UP SINGLE AND LEFT DOUBLE
    "\u255C" : "+", // BOX DRAWINGS UP DOUBLE AND LEFT SINGLE
    "\u255D" : "+", // BOX DRAWINGS DOUBLE UP AND LEFT
    "\u255E" : "+", // BOX DRAWINGS VERTICAL SINGLE AND RIGHT DOUBLE
    "\u255F" : "+", // BOX DRAWINGS VERTICAL DOUBLE AND RIGHT SINGLE
    "\u2560" : "+", // BOX DRAWINGS DOUBLE VERTICAL AND RIGHT
    "\u2561" : "+", // BOX DRAWINGS VERTICAL SINGLE AND LEFT DOUBLE
    "\u2562" : "+", // BOX DRAWINGS VERTICAL DOUBLE AND LEFT SINGLE
    "\u2563" : "+", // BOX DRAWINGS DOUBLE VERTICAL AND LEFT
    "\u2564" : "+", // BOX DRAWINGS DOWN SINGLE AND HORIZONTAL DOUBLE
    "\u2565" : "+", // BOX DRAWINGS DOWN DOUBLE AND HORIZONTAL SINGLE
    "\u2566" : "+", // BOX DRAWINGS DOUBLE DOWN AND HORIZONTAL
    "\u2567" : "+", // BOX DRAWINGS UP SINGLE AND HORIZONTAL DOUBLE
    "\u2568" : "+", // BOX DRAWINGS UP DOUBLE AND HORIZONTAL SINGLE
    "\u2569" : "+", // BOX DRAWINGS DOUBLE UP AND HORIZONTAL
    "\u256A" : "+", // BOX DRAWINGS VERTICAL SINGLE AND HORIZONTAL DOUBLE
    "\u256B" : "+", // BOX DRAWINGS VERTICAL DOUBLE AND HORIZONTAL SINGLE
    "\u256C" : "+", // BOX DRAWINGS DOUBLE VERTICAL AND HORIZONTAL
    "\u256D" : "+", // BOX DRAWINGS LIGHT ARC DOWN AND RIGHT
    "\u256E" : "+", // BOX DRAWINGS LIGHT ARC DOWN AND LEFT
    "\u256F" : "+", // BOX DRAWINGS LIGHT ARC UP AND LEFT
    "\u2570" : "+", // BOX DRAWINGS LIGHT ARC UP AND RIGHT
    "\u2571" : "/", // BOX DRAWINGS LIGHT DIAGONAL UPPER RIGHT TO LOWER LEFT
    "\u2572" : "\\", // BOX DRAWINGS LIGHT DIAGONAL UPPER LEFT TO LOWER RIGHT
    "\u2573" : "X", // BOX DRAWINGS LIGHT DIAGONAL CROSS
    "\u257C" : "-", // BOX DRAWINGS LIGHT LEFT AND HEAVY RIGHT
    "\u257D" : "|", // BOX DRAWINGS LIGHT UP AND HEAVY DOWN
    "\u257E" : "-", // BOX DRAWINGS HEAVY LEFT AND LIGHT RIGHT
    "\u257F" : "|", // BOX DRAWINGS HEAVY UP AND LIGHT DOWN
    "\u25CB" : "o", // WHITE CIRCLE
    "\u25E6" : "{\\textopenbullet}", // WHITE BULLET
    "\u2605" : "*", // BLACK STAR
    "\u2606" : "*", // WHITE STAR
    "\u2612" : "X", // BALLOT BOX WITH X
    "\u2613" : "X", // SALTIRE
    "\u2639" : ":-(", // WHITE FROWNING FACE
    "\u263A" : ":-)", // WHITE SMILING FACE
    "\u263B" : "(-:", // BLACK SMILING FACE
    "\u266D" : "b", // MUSIC FLAT SIGN
    "\u266F" : "$\\#$", // MUSIC SHARP SIGN
    "\u2701" : "$\\%<$", // UPPER BLADE SCISSORS
    "\u2702" : "$\\%<$", // BLACK SCISSORS
    "\u2703" : "$\\%<$", // LOWER BLADE SCISSORS
    "\u2704" : "$\\%<$", // WHITE SCISSORS
    "\u270C" : "V", // VICTORY HAND
    "\u2713" : "v", // CHECK MARK
    "\u2714" : "V", // HEAVY CHECK MARK
    "\u2715" : "x", // MULTIPLICATION X
    "\u2716" : "x", // HEAVY MULTIPLICATION X
    "\u2717" : "X", // BALLOT X
    "\u2718" : "X", // HEAVY BALLOT X
    "\u2719" : "+", // OUTLINED GREEK CROSS
    "\u271A" : "+", // HEAVY GREEK CROSS
    "\u271B" : "+", // OPEN CENTRE CROSS
    "\u271C" : "+", // HEAVY OPEN CENTRE CROSS
    "\u271D" : "+", // LATIN CROSS
    "\u271E" : "+", // SHADOWED WHITE LATIN CROSS
    "\u271F" : "+", // OUTLINED LATIN CROSS
    "\u2720" : "+", // MALTESE CROSS
    "\u2721" : "*", // STAR OF DAVID
    "\u2722" : "+", // FOUR TEARDROP-SPOKED ASTERISK
    "\u2723" : "+", // FOUR BALLOON-SPOKED ASTERISK
    "\u2724" : "+", // HEAVY FOUR BALLOON-SPOKED ASTERISK
    "\u2725" : "+", // FOUR CLUB-SPOKED ASTERISK
    "\u2726" : "+", // BLACK FOUR POINTED STAR
    "\u2727" : "+", // WHITE FOUR POINTED STAR
    "\u2729" : "*", // STRESS OUTLINED WHITE STAR
    "\u272A" : "*", // CIRCLED WHITE STAR
    "\u272B" : "*", // OPEN CENTRE BLACK STAR
    "\u272C" : "*", // BLACK CENTRE WHITE STAR
    "\u272D" : "*", // OUTLINED BLACK STAR
    "\u272E" : "*", // HEAVY OUTLINED BLACK STAR
    "\u272F" : "*", // PINWHEEL STAR
    "\u2730" : "*", // SHADOWED WHITE STAR
    "\u2731" : "*", // HEAVY ASTERISK
    "\u2732" : "*", // OPEN CENTRE ASTERISK
    "\u2733" : "*", // EIGHT SPOKED ASTERISK
    "\u2734" : "*", // EIGHT POINTED BLACK STAR
    "\u2735" : "*", // EIGHT POINTED PINWHEEL STAR
    "\u2736" : "*", // SIX POINTED BLACK STAR
    "\u2737" : "*", // EIGHT POINTED RECTILINEAR BLACK STAR
    "\u2738" : "*", // HEAVY EIGHT POINTED RECTILINEAR BLACK STAR
    "\u2739" : "*", // TWELVE POINTED BLACK STAR
    "\u273A" : "*", // SIXTEEN POINTED ASTERISK
    "\u273B" : "*", // TEARDROP-SPOKED ASTERISK
    "\u273C" : "*", // OPEN CENTRE TEARDROP-SPOKED ASTERISK
    "\u273D" : "*", // HEAVY TEARDROP-SPOKED ASTERISK
    "\u273E" : "*", // SIX PETALLED BLACK AND WHITE FLORETTE
    "\u273F" : "*", // BLACK FLORETTE
    "\u2740" : "*", // WHITE FLORETTE
    "\u2741" : "*", // EIGHT PETALLED OUTLINED BLACK FLORETTE
    "\u2742" : "*", // CIRCLED OPEN CENTRE EIGHT POINTED STAR
    "\u2743" : "*", // HEAVY TEARDROP-SPOKED PINWHEEL ASTERISK
    "\u2744" : "*", // SNOWFLAKE
    "\u2745" : "*", // TIGHT TRIFOLIATE SNOWFLAKE
    "\u2746" : "*", // HEAVY CHEVRON SNOWFLAKE
    "\u2747" : "*", // SPARKLE
    "\u2748" : "*", // HEAVY SPARKLE
    "\u2749" : "*", // BALLOON-SPOKED ASTERISK
    "\u274A" : "*", // EIGHT TEARDROP-SPOKED PROPELLER ASTERISK
    "\u274B" : "*", // HEAVY EIGHT TEARDROP-SPOKED PROPELLER ASTERISK
    "\uFB00" : "ff", // LATIN SMALL LIGATURE FF
    "\uFB01" : "fi", // LATIN SMALL LIGATURE FI
    "\uFB02" : "fl", // LATIN SMALL LIGATURE FL
    "\uFB03" : "ffi", // LATIN SMALL LIGATURE FFI
    "\uFB04" : "ffl", // LATIN SMALL LIGATURE FFL
    "\uFB05" : "st", // LATIN SMALL LIGATURE LONG S T
    "\uFB06" : "st", // LATIN SMALL LIGATURE ST
    /* Derived accented characters */

    "\u00C0" : "\\`{A}", // LATIN CAPITAL LETTER A WITH GRAVE
    "\u00C1" : "\\'{A}", // LATIN CAPITAL LETTER A WITH ACUTE
    "\u00C2" : "\\^{A}", // LATIN CAPITAL LETTER A WITH CIRCUMFLEX
    "\u00C3" : "\\~{A}", // LATIN CAPITAL LETTER A WITH TILDE
    "\u00C4" : "\\\"{A}", // LATIN CAPITAL LETTER A WITH DIAERESIS
    "\u00C7" : "\\c{C}", // LATIN CAPITAL LETTER C WITH CEDILLA
    "\u00C8" : "\\`{E}", // LATIN CAPITAL LETTER E WITH GRAVE
    "\u00C9" : "\\'{E}", // LATIN CAPITAL LETTER E WITH ACUTE
    "\u00CA" : "\\^{E}", // LATIN CAPITAL LETTER E WITH CIRCUMFLEX
    "\u00CB" : "\\\"{E}", // LATIN CAPITAL LETTER E WITH DIAERESIS
    "\u00CC" : "\\`{I}", // LATIN CAPITAL LETTER I WITH GRAVE
    "\u00CD" : "\\'{I}", // LATIN CAPITAL LETTER I WITH ACUTE
    "\u00CE" : "\\^{I}", // LATIN CAPITAL LETTER I WITH CIRCUMFLEX
    "\u00CF" : "\\\"{I}", // LATIN CAPITAL LETTER I WITH DIAERESIS
    "\u00D1" : "\\~{N}", // LATIN CAPITAL LETTER N WITH TILDE
    "\u00D2" : "\\`{O}", // LATIN CAPITAL LETTER O WITH GRAVE
    "\u00D3" : "\\'{O}", // LATIN CAPITAL LETTER O WITH ACUTE
    "\u00D4" : "\\^{O}", // LATIN CAPITAL LETTER O WITH CIRCUMFLEX
    "\u00D5" : "\\~{O}", // LATIN CAPITAL LETTER O WITH TILDE
    "\u00D6" : "\\\"{O}", // LATIN CAPITAL LETTER O WITH DIAERESIS
    "\u00D9" : "\\`{U}", // LATIN CAPITAL LETTER U WITH GRAVE
    "\u00DA" : "\\'{U}", // LATIN CAPITAL LETTER U WITH ACUTE
    "\u00DB" : "\\^{U}", // LATIN CAPITAL LETTER U WITH CIRCUMFLEX
    "\u00DC" : "\\\"{U}", // LATIN CAPITAL LETTER U WITH DIAERESIS
    "\u00DD" : "\\'{Y}", // LATIN CAPITAL LETTER Y WITH ACUTE
    "\u00E0" : "\\`{a}", // LATIN SMALL LETTER A WITH GRAVE
    "\u00E1" : "\\'{a}", // LATIN SMALL LETTER A WITH ACUTE
    "\u00E2" : "\\^{a}", // LATIN SMALL LETTER A WITH CIRCUMFLEX
    "\u00E3" : "\\~{a}", // LATIN SMALL LETTER A WITH TILDE
    "\u00E4" : "\\\"{a}", // LATIN SMALL LETTER A WITH DIAERESIS
    "\u00E7" : "\\c{c}", // LATIN SMALL LETTER C WITH CEDILLA
    "\u00E8" : "\\`{e}", // LATIN SMALL LETTER E WITH GRAVE
    "\u00E9" : "\\'{e}", // LATIN SMALL LETTER E WITH ACUTE
    "\u00EA" : "\\^{e}", // LATIN SMALL LETTER E WITH CIRCUMFLEX
    "\u00EB" : "\\\"{e}", // LATIN SMALL LETTER E WITH DIAERESIS
    "\u00EC" : "\\`{i}", // LATIN SMALL LETTER I WITH GRAVE
    "\u00ED" : "\\'{i}", // LATIN SMALL LETTER I WITH ACUTE
    "\u00EE" : "\\^{i}", // LATIN SMALL LETTER I WITH CIRCUMFLEX
    "\u00EF" : "\\\"{i}", // LATIN SMALL LETTER I WITH DIAERESIS
    "\u00F1" : "\\~{n}", // LATIN SMALL LETTER N WITH TILDE
    "\u00F2" : "\\`{o}", // LATIN SMALL LETTER O WITH GRAVE
    "\u00F3" : "\\'{o}", // LATIN SMALL LETTER O WITH ACUTE
    "\u00F4" : "\\^{o}", // LATIN SMALL LETTER O WITH CIRCUMFLEX
    "\u00F5" : "\\~{o}", // LATIN SMALL LETTER O WITH TILDE
    "\u00F6" : "\\\"{o}", // LATIN SMALL LETTER O WITH DIAERESIS
    "\u00F9" : "\\`{u}", // LATIN SMALL LETTER U WITH GRAVE
    "\u00FA" : "\\'{u}", // LATIN SMALL LETTER U WITH ACUTE
    "\u00FB" : "\\^{u}", // LATIN SMALL LETTER U WITH CIRCUMFLEX
    "\u00FC" : "\\\"{u}", // LATIN SMALL LETTER U WITH DIAERESIS
    "\u00FD" : "\\'{y}", // LATIN SMALL LETTER Y WITH ACUTE
    "\u00FF" : "\\\"{y}", // LATIN SMALL LETTER Y WITH DIAERESIS
    "\u0100" : "\\={A}", // LATIN CAPITAL LETTER A WITH MACRON
    "\u0101" : "\\={a}", // LATIN SMALL LETTER A WITH MACRON
    "\u0102" : "\\u{A}", // LATIN CAPITAL LETTER A WITH BREVE
    "\u0103" : "\\u{a}", // LATIN SMALL LETTER A WITH BREVE
    "\u0104" : "\\k{A}", // LATIN CAPITAL LETTER A WITH OGONEK
    "\u0105" : "\\k{a}", // LATIN SMALL LETTER A WITH OGONEK
    "\u0106" : "\\'{C}", // LATIN CAPITAL LETTER C WITH ACUTE
    "\u0107" : "\\'{c}", // LATIN SMALL LETTER C WITH ACUTE
    "\u0108" : "\\^{C}", // LATIN CAPITAL LETTER C WITH CIRCUMFLEX
    "\u0109" : "\\^{c}", // LATIN SMALL LETTER C WITH CIRCUMFLEX
    "\u010A" : "\\.{C}", // LATIN CAPITAL LETTER C WITH DOT ABOVE
    "\u010B" : "\\.{c}", // LATIN SMALL LETTER C WITH DOT ABOVE
    "\u010C" : "\\v{C}", // LATIN CAPITAL LETTER C WITH CARON
    "\u010D" : "\\v{c}", // LATIN SMALL LETTER C WITH CARON
    "\u010E" : "\\v{D}", // LATIN CAPITAL LETTER D WITH CARON
    "\u010F" : "\\v{d}", // LATIN SMALL LETTER D WITH CARON
    "\u0112" : "\\={E}", // LATIN CAPITAL LETTER E WITH MACRON
    "\u0113" : "\\={e}", // LATIN SMALL LETTER E WITH MACRON
    "\u0114" : "\\u{E}", // LATIN CAPITAL LETTER E WITH BREVE
    "\u0115" : "\\u{e}", // LATIN SMALL LETTER E WITH BREVE
    "\u0116" : "\\.{E}", // LATIN CAPITAL LETTER E WITH DOT ABOVE
    "\u0117" : "\\.{e}", // LATIN SMALL LETTER E WITH DOT ABOVE
    "\u0118" : "\\k{E}", // LATIN CAPITAL LETTER E WITH OGONEK
    "\u0119" : "\\k{e}", // LATIN SMALL LETTER E WITH OGONEK
    "\u011A" : "\\v{E}", // LATIN CAPITAL LETTER E WITH CARON
    "\u011B" : "\\v{e}", // LATIN SMALL LETTER E WITH CARON
    "\u011C" : "\\^{G}", // LATIN CAPITAL LETTER G WITH CIRCUMFLEX
    "\u011D" : "\\^{g}", // LATIN SMALL LETTER G WITH CIRCUMFLEX
    "\u011E" : "\\u{G}", // LATIN CAPITAL LETTER G WITH BREVE
    "\u011F" : "\\u{g}", // LATIN SMALL LETTER G WITH BREVE
    "\u0120" : "\\.{G}", // LATIN CAPITAL LETTER G WITH DOT ABOVE
    "\u0121" : "\\.{g}", // LATIN SMALL LETTER G WITH DOT ABOVE
    "\u0122" : "\\c{G}", // LATIN CAPITAL LETTER G WITH CEDILLA
    "\u0123" : "\\c{g}", // LATIN SMALL LETTER G WITH CEDILLA
    "\u0124" : "\\^{H}", // LATIN CAPITAL LETTER H WITH CIRCUMFLEX
    "\u0125" : "\\^{h}", // LATIN SMALL LETTER H WITH CIRCUMFLEX
    "\u0128" : "\\~{I}", // LATIN CAPITAL LETTER I WITH TILDE
    "\u0129" : "\\~{i}", // LATIN SMALL LETTER I WITH TILDE
    "\u012A" : "\\={I}", // LATIN CAPITAL LETTER I WITH MACRON
    "\u012B" : "\\={i}", // LATIN SMALL LETTER I WITH MACRON
    "\u012C" : "\\u{I}", // LATIN CAPITAL LETTER I WITH BREVE
    "\u012D" : "\\u{i}", // LATIN SMALL LETTER I WITH BREVE
    "\u012E" : "\\k{I}", // LATIN CAPITAL LETTER I WITH OGONEK
    "\u012F" : "\\k{i}", // LATIN SMALL LETTER I WITH OGONEK
    "\u0130" : "\\.{I}", // LATIN CAPITAL LETTER I WITH DOT ABOVE
    "\u0134" : "\\^{J}", // LATIN CAPITAL LETTER J WITH CIRCUMFLEX
    "\u0135" : "\\^{j}", // LATIN SMALL LETTER J WITH CIRCUMFLEX
    "\u0136" : "\\c{K}", // LATIN CAPITAL LETTER K WITH CEDILLA
    "\u0137" : "\\c{k}", // LATIN SMALL LETTER K WITH CEDILLA
    "\u0139" : "\\'{L}", // LATIN CAPITAL LETTER L WITH ACUTE
    "\u013A" : "\\'{l}", // LATIN SMALL LETTER L WITH ACUTE
    "\u013B" : "\\c{L}", // LATIN CAPITAL LETTER L WITH CEDILLA
    "\u013C" : "\\c{l}", // LATIN SMALL LETTER L WITH CEDILLA
    "\u013D" : "\\v{L}", // LATIN CAPITAL LETTER L WITH CARON
    "\u013E" : "\\v{l}", // LATIN SMALL LETTER L WITH CARON
    "\u0141" : "\\L{}", //LATIN CAPITAL LETTER L WITH STROKE
    "\u0142" : "\\l{}", //LATIN SMALL LETTER L WITH STROKE
    "\u0143" : "\\'{N}", // LATIN CAPITAL LETTER N WITH ACUTE
    "\u0144" : "\\'{n}", // LATIN SMALL LETTER N WITH ACUTE
    "\u0145" : "\\c{N}", // LATIN CAPITAL LETTER N WITH CEDILLA
    "\u0146" : "\\c{n}", // LATIN SMALL LETTER N WITH CEDILLA
    "\u0147" : "\\v{N}", // LATIN CAPITAL LETTER N WITH CARON
    "\u0148" : "\\v{n}", // LATIN SMALL LETTER N WITH CARON
    "\u014C" : "\\={O}", // LATIN CAPITAL LETTER O WITH MACRON
    "\u014D" : "\\={o}", // LATIN SMALL LETTER O WITH MACRON
    "\u014E" : "\\u{O}", // LATIN CAPITAL LETTER O WITH BREVE
    "\u014F" : "\\u{o}", // LATIN SMALL LETTER O WITH BREVE
    "\u0150" : "\\H{O}", // LATIN CAPITAL LETTER O WITH DOUBLE ACUTE
    "\u0151" : "\\H{o}", // LATIN SMALL LETTER O WITH DOUBLE ACUTE
    "\u0154" : "\\'{R}", // LATIN CAPITAL LETTER R WITH ACUTE
    "\u0155" : "\\'{r}", // LATIN SMALL LETTER R WITH ACUTE
    "\u0156" : "\\c{R}", // LATIN CAPITAL LETTER R WITH CEDILLA
    "\u0157" : "\\c{r}", // LATIN SMALL LETTER R WITH CEDILLA
    "\u0158" : "\\v{R}", // LATIN CAPITAL LETTER R WITH CARON
    "\u0159" : "\\v{r}", // LATIN SMALL LETTER R WITH CARON
    "\u015A" : "\\'{S}", // LATIN CAPITAL LETTER S WITH ACUTE
    "\u015B" : "\\'{s}", // LATIN SMALL LETTER S WITH ACUTE
    "\u015C" : "\\^{S}", // LATIN CAPITAL LETTER S WITH CIRCUMFLEX
    "\u015D" : "\\^{s}", // LATIN SMALL LETTER S WITH CIRCUMFLEX
    "\u015E" : "\\c{S}", // LATIN CAPITAL LETTER S WITH CEDILLA
    "\u015F" : "\\c{s}", // LATIN SMALL LETTER S WITH CEDILLA
    "\u0160" : "\\v{S}", // LATIN CAPITAL LETTER S WITH CARON
    "\u0161" : "\\v{s}", // LATIN SMALL LETTER S WITH CARON
    "\u0162" : "\\c{T}", // LATIN CAPITAL LETTER T WITH CEDILLA
    "\u0163" : "\\c{t}", // LATIN SMALL LETTER T WITH CEDILLA
    "\u0164" : "\\v{T}", // LATIN CAPITAL LETTER T WITH CARON
    "\u0165" : "\\v{t}", // LATIN SMALL LETTER T WITH CARON
    "\u0168" : "\\~{U}", // LATIN CAPITAL LETTER U WITH TILDE
    "\u0169" : "\\~{u}", // LATIN SMALL LETTER U WITH TILDE
    "\u016A" : "\\={U}", // LATIN CAPITAL LETTER U WITH MACRON
    "\u016B" : "\\={u}", // LATIN SMALL LETTER U WITH MACRON
    "\u016C" : "\\u{U}", // LATIN CAPITAL LETTER U WITH BREVE
    "\u016D" : "\\u{u}", // LATIN SMALL LETTER U WITH BREVE
    "\u0170" : "\\H{U}", // LATIN CAPITAL LETTER U WITH DOUBLE ACUTE
    "\u0171" : "\\H{u}", // LATIN SMALL LETTER U WITH DOUBLE ACUTE
    "\u0172" : "\\k{U}", // LATIN CAPITAL LETTER U WITH OGONEK
    "\u0173" : "\\k{u}", // LATIN SMALL LETTER U WITH OGONEK
    "\u0174" : "\\^{W}", // LATIN CAPITAL LETTER W WITH CIRCUMFLEX
    "\u0175" : "\\^{w}", // LATIN SMALL LETTER W WITH CIRCUMFLEX
    "\u0176" : "\\^{Y}", // LATIN CAPITAL LETTER Y WITH CIRCUMFLEX
    "\u0177" : "\\^{y}", // LATIN SMALL LETTER Y WITH CIRCUMFLEX
    "\u0178" : "\\\"{Y}", // LATIN CAPITAL LETTER Y WITH DIAERESIS
    "\u0179" : "\\'{Z}", // LATIN CAPITAL LETTER Z WITH ACUTE
    "\u017A" : "\\'{z}", // LATIN SMALL LETTER Z WITH ACUTE
    "\u017B" : "\\.{Z}", // LATIN CAPITAL LETTER Z WITH DOT ABOVE
    "\u017C" : "\\.{z}", // LATIN SMALL LETTER Z WITH DOT ABOVE
    "\u017D" : "\\v{Z}", // LATIN CAPITAL LETTER Z WITH CARON
    "\u017E" : "\\v{z}", // LATIN SMALL LETTER Z WITH CARON
    "\u01CD" : "\\v{A}", // LATIN CAPITAL LETTER A WITH CARON
    "\u01CE" : "\\v{a}", // LATIN SMALL LETTER A WITH CARON
    "\u01CF" : "\\v{I}", // LATIN CAPITAL LETTER I WITH CARON
    "\u01D0" : "\\v{i}", // LATIN SMALL LETTER I WITH CARON
    "\u01D1" : "\\v{O}", // LATIN CAPITAL LETTER O WITH CARON
    "\u01D2" : "\\v{o}", // LATIN SMALL LETTER O WITH CARON
    "\u01D3" : "\\v{U}", // LATIN CAPITAL LETTER U WITH CARON
    "\u01D4" : "\\v{u}", // LATIN SMALL LETTER U WITH CARON
    "\u01E6" : "\\v{G}", // LATIN CAPITAL LETTER G WITH CARON
    "\u01E7" : "\\v{g}", // LATIN SMALL LETTER G WITH CARON
    "\u01E8" : "\\v{K}", // LATIN CAPITAL LETTER K WITH CARON
    "\u01E9" : "\\v{k}", // LATIN SMALL LETTER K WITH CARON
    "\u01EA" : "\\k{O}", // LATIN CAPITAL LETTER O WITH OGONEK
    "\u01EB" : "\\k{o}", // LATIN SMALL LETTER O WITH OGONEK
    "\u01F0" : "\\v{j}", // LATIN SMALL LETTER J WITH CARON
    "\u01F4" : "\\'{G}", // LATIN CAPITAL LETTER G WITH ACUTE
    "\u01F5" : "\\'{g}", // LATIN SMALL LETTER G WITH ACUTE
    "\u1E02" : "\\.{B}", // LATIN CAPITAL LETTER B WITH DOT ABOVE
    "\u1E03" : "\\.{b}", // LATIN SMALL LETTER B WITH DOT ABOVE
    "\u1E04" : "\\d{B}", // LATIN CAPITAL LETTER B WITH DOT BELOW
    "\u1E05" : "\\d{b}", // LATIN SMALL LETTER B WITH DOT BELOW
    "\u1E06" : "\\b{B}", // LATIN CAPITAL LETTER B WITH LINE BELOW
    "\u1E07" : "\\b{b}", // LATIN SMALL LETTER B WITH LINE BELOW
    "\u1E0A" : "\\.{D}", // LATIN CAPITAL LETTER D WITH DOT ABOVE
    "\u1E0B" : "\\.{d}", // LATIN SMALL LETTER D WITH DOT ABOVE
    "\u1E0C" : "\\d{D}", // LATIN CAPITAL LETTER D WITH DOT BELOW
    "\u1E0D" : "\\d{d}", // LATIN SMALL LETTER D WITH DOT BELOW
    "\u1E0E" : "\\b{D}", // LATIN CAPITAL LETTER D WITH LINE BELOW
    "\u1E0F" : "\\b{d}", // LATIN SMALL LETTER D WITH LINE BELOW
    "\u1E10" : "\\c{D}", // LATIN CAPITAL LETTER D WITH CEDILLA
    "\u1E11" : "\\c{d}", // LATIN SMALL LETTER D WITH CEDILLA
    "\u1E1E" : "\\.{F}", // LATIN CAPITAL LETTER F WITH DOT ABOVE
    "\u1E1F" : "\\.{f}", // LATIN SMALL LETTER F WITH DOT ABOVE
    "\u1E20" : "\\={G}", // LATIN CAPITAL LETTER G WITH MACRON
    "\u1E21" : "\\={g}", // LATIN SMALL LETTER G WITH MACRON
    "\u1E22" : "\\.{H}", // LATIN CAPITAL LETTER H WITH DOT ABOVE
    "\u1E23" : "\\.{h}", // LATIN SMALL LETTER H WITH DOT ABOVE
    "\u1E24" : "\\d{H}", // LATIN CAPITAL LETTER H WITH DOT BELOW
    "\u1E25" : "\\d{h}", // LATIN SMALL LETTER H WITH DOT BELOW
    "\u1E26" : "\\\"{H}", // LATIN CAPITAL LETTER H WITH DIAERESIS
    "\u1E27" : "\\\"{h}", // LATIN SMALL LETTER H WITH DIAERESIS
    "\u1E28" : "\\c{H}", // LATIN CAPITAL LETTER H WITH CEDILLA
    "\u1E29" : "\\c{h}", // LATIN SMALL LETTER H WITH CEDILLA
    "\u1E30" : "\\'{K}", // LATIN CAPITAL LETTER K WITH ACUTE
    "\u1E31" : "\\'{k}", // LATIN SMALL LETTER K WITH ACUTE
    "\u1E32" : "\\d{K}", // LATIN CAPITAL LETTER K WITH DOT BELOW
    "\u1E33" : "\\d{k}", // LATIN SMALL LETTER K WITH DOT BELOW
    "\u1E34" : "\\b{K}", // LATIN CAPITAL LETTER K WITH LINE BELOW
    "\u1E35" : "\\b{k}", // LATIN SMALL LETTER K WITH LINE BELOW
    "\u1E36" : "\\d{L}", // LATIN CAPITAL LETTER L WITH DOT BELOW
    "\u1E37" : "\\d{l}", // LATIN SMALL LETTER L WITH DOT BELOW
    "\u1E3A" : "\\b{L}", // LATIN CAPITAL LETTER L WITH LINE BELOW
    "\u1E3B" : "\\b{l}", // LATIN SMALL LETTER L WITH LINE BELOW
    "\u1E3E" : "\\'{M}", // LATIN CAPITAL LETTER M WITH ACUTE
    "\u1E3F" : "\\'{m}", // LATIN SMALL LETTER M WITH ACUTE
    "\u1E40" : "\\.{M}", // LATIN CAPITAL LETTER M WITH DOT ABOVE
    "\u1E41" : "\\.{m}", // LATIN SMALL LETTER M WITH DOT ABOVE
    "\u1E42" : "\\d{M}", // LATIN CAPITAL LETTER M WITH DOT BELOW
    "\u1E43" : "\\d{m}", // LATIN SMALL LETTER M WITH DOT BELOW
    "\u1E44" : "\\.{N}", // LATIN CAPITAL LETTER N WITH DOT ABOVE
    "\u1E45" : "\\.{n}", // LATIN SMALL LETTER N WITH DOT ABOVE
    "\u1E46" : "\\d{N}", // LATIN CAPITAL LETTER N WITH DOT BELOW
    "\u1E47" : "\\d{n}", // LATIN SMALL LETTER N WITH DOT BELOW
    "\u1E48" : "\\b{N}", // LATIN CAPITAL LETTER N WITH LINE BELOW
    "\u1E49" : "\\b{n}", // LATIN SMALL LETTER N WITH LINE BELOW
    "\u1E54" : "\\'{P}", // LATIN CAPITAL LETTER P WITH ACUTE
    "\u1E55" : "\\'{p}", // LATIN SMALL LETTER P WITH ACUTE
    "\u1E56" : "\\.{P}", // LATIN CAPITAL LETTER P WITH DOT ABOVE
    "\u1E57" : "\\.{p}", // LATIN SMALL LETTER P WITH DOT ABOVE
    "\u1E58" : "\\.{R}", // LATIN CAPITAL LETTER R WITH DOT ABOVE
    "\u1E59" : "\\.{r}", // LATIN SMALL LETTER R WITH DOT ABOVE
    "\u1E5A" : "\\d{R}", // LATIN CAPITAL LETTER R WITH DOT BELOW
    "\u1E5B" : "\\d{r}", // LATIN SMALL LETTER R WITH DOT BELOW
    "\u1E5E" : "\\b{R}", // LATIN CAPITAL LETTER R WITH LINE BELOW
    "\u1E5F" : "\\b{r}", // LATIN SMALL LETTER R WITH LINE BELOW
    "\u1E60" : "\\.{S}", // LATIN CAPITAL LETTER S WITH DOT ABOVE
    "\u1E61" : "\\.{s}", // LATIN SMALL LETTER S WITH DOT ABOVE
    "\u1E62" : "\\d{S}", // LATIN CAPITAL LETTER S WITH DOT BELOW
    "\u1E63" : "\\d{s}", // LATIN SMALL LETTER S WITH DOT BELOW
    "\u1E6A" : "\\.{T}", // LATIN CAPITAL LETTER T WITH DOT ABOVE
    "\u1E6B" : "\\.{t}", // LATIN SMALL LETTER T WITH DOT ABOVE
    "\u1E6C" : "\\d{T}", // LATIN CAPITAL LETTER T WITH DOT BELOW
    "\u1E6D" : "\\d{t}", // LATIN SMALL LETTER T WITH DOT BELOW
    "\u1E6E" : "\\b{T}", // LATIN CAPITAL LETTER T WITH LINE BELOW
    "\u1E6F" : "\\b{t}", // LATIN SMALL LETTER T WITH LINE BELOW
    "\u1E7C" : "\\~{V}", // LATIN CAPITAL LETTER V WITH TILDE
    "\u1E7D" : "\\~{v}", // LATIN SMALL LETTER V WITH TILDE
    "\u1E7E" : "\\d{V}", // LATIN CAPITAL LETTER V WITH DOT BELOW
    "\u1E7F" : "\\d{v}", // LATIN SMALL LETTER V WITH DOT BELOW
    "\u1E80" : "\\`{W}", // LATIN CAPITAL LETTER W WITH GRAVE
    "\u1E81" : "\\`{w}", // LATIN SMALL LETTER W WITH GRAVE
    "\u1E82" : "\\'{W}", // LATIN CAPITAL LETTER W WITH ACUTE
    "\u1E83" : "\\'{w}", // LATIN SMALL LETTER W WITH ACUTE
    "\u1E84" : "\\\"{W}", // LATIN CAPITAL LETTER W WITH DIAERESIS
    "\u1E85" : "\\\"{w}", // LATIN SMALL LETTER W WITH DIAERESIS
    "\u1E86" : "\\.{W}", // LATIN CAPITAL LETTER W WITH DOT ABOVE
    "\u1E87" : "\\.{w}", // LATIN SMALL LETTER W WITH DOT ABOVE
    "\u1E88" : "\\d{W}", // LATIN CAPITAL LETTER W WITH DOT BELOW
    "\u1E89" : "\\d{w}", // LATIN SMALL LETTER W WITH DOT BELOW
    "\u1E8A" : "\\.{X}", // LATIN CAPITAL LETTER X WITH DOT ABOVE
    "\u1E8B" : "\\.{x}", // LATIN SMALL LETTER X WITH DOT ABOVE
    "\u1E8C" : "\\\"{X}", // LATIN CAPITAL LETTER X WITH DIAERESIS
    "\u1E8D" : "\\\"{x}", // LATIN SMALL LETTER X WITH DIAERESIS
    "\u1E8E" : "\\.{Y}", // LATIN CAPITAL LETTER Y WITH DOT ABOVE
    "\u1E8F" : "\\.{y}", // LATIN SMALL LETTER Y WITH DOT ABOVE
    "\u1E90" : "\\^{Z}", // LATIN CAPITAL LETTER Z WITH CIRCUMFLEX
    "\u1E91" : "\\^{z}", // LATIN SMALL LETTER Z WITH CIRCUMFLEX
    "\u1E92" : "\\d{Z}", // LATIN CAPITAL LETTER Z WITH DOT BELOW
    "\u1E93" : "\\d{z}", // LATIN SMALL LETTER Z WITH DOT BELOW
    "\u1E94" : "\\b{Z}", // LATIN CAPITAL LETTER Z WITH LINE BELOW
    "\u1E95" : "\\b{z}", // LATIN SMALL LETTER Z WITH LINE BELOW
    "\u1E96" : "\\b{h}", // LATIN SMALL LETTER H WITH LINE BELOW
    "\u1E97" : "\\\"{t}", // LATIN SMALL LETTER T WITH DIAERESIS
    "\u1EA0" : "\\d{A}", // LATIN CAPITAL LETTER A WITH DOT BELOW
    "\u1EA1" : "\\d{a}", // LATIN SMALL LETTER A WITH DOT BELOW
    "\u1EB8" : "\\d{E}", // LATIN CAPITAL LETTER E WITH DOT BELOW
    "\u1EB9" : "\\d{e}", // LATIN SMALL LETTER E WITH DOT BELOW
    "\u1EBC" : "\\~{E}", // LATIN CAPITAL LETTER E WITH TILDE
    "\u1EBD" : "\\~{e}", // LATIN SMALL LETTER E WITH TILDE
    "\u1ECA" : "\\d{I}", // LATIN CAPITAL LETTER I WITH DOT BELOW
    "\u1ECB" : "\\d{i}", // LATIN SMALL LETTER I WITH DOT BELOW
    "\u1ECC" : "\\d{O}", // LATIN CAPITAL LETTER O WITH DOT BELOW
    "\u1ECD" : "\\d{o}", // LATIN SMALL LETTER O WITH DOT BELOW
    "\u1EE4" : "\\d{U}", // LATIN CAPITAL LETTER U WITH DOT BELOW
    "\u1EE5" : "\\d{u}", // LATIN SMALL LETTER U WITH DOT BELOW
    "\u1EF2" : "\\`{Y}", // LATIN CAPITAL LETTER Y WITH GRAVE
    "\u1EF3" : "\\`{y}", // LATIN SMALL LETTER Y WITH GRAVE
    "\u1EF4" : "\\d{Y}", // LATIN CAPITAL LETTER Y WITH DOT BELOW
    "\u1EF5" : "\\d{y}", // LATIN SMALL LETTER Y WITH DOT BELOW
    "\u1EF8" : "\\~{Y}", // LATIN CAPITAL LETTER Y WITH TILDE
    "\u1EF9" : "\\~{y}" // LATIN SMALL LETTER Y WITH TILDE
};
