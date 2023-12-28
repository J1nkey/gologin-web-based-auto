class ProxyModel {
    _mode;
    _host;
    _port;
    _isAuthenticateRequire;
    _username;
    _password;

    constructor() {
        this._mode = "http";
    }
    constructor(mode, host, port, isAuthenticateRequire, username, password) {
        this._mode = mode;
        this._host = host;
        this._port = port;
        this._isAuthenticateRequire = isAuthenticateRequire;
        this._username = username;
        this._password = password;
    }
}