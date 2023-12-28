class StorageModel {
    _local;
    _bookmarks;
    _extensions;
    _history;
    _passwords;
    _session;
    _indexedDb;

    constructor() {
        this._local = true;
        this._extensions = true;
        this._bookmarks = true;
        this._history = true;   
        this._session = true;
        this._passwords = true;
        this._indexedDb = false;
    }

    constructor(local, extensions, bookmarks, history, passwords, session, indexedDb) {
        this._local = local;
        this._extensions = extensions;
        this._bookmarks = bookmarks;
        this._history = history;
        this._passwords = passwords;
        this._session = session;
        this._indexedDb = indexedDb; 
    }
}