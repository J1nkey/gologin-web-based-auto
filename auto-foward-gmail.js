import puppeteer from "puppeteer-core";

import GoLoginBroker from "./gologin-broker.js";

class GLAutoForwardGmail {
    _glBroker;
    _email;
    _password;
    _mailForwarded;

    // GL properties
    _browser;
    _currentPage;

    _userAgentSettingString;
    _defaultPageWidth;
    _defaultPageHeight;

    _isNoLoginPageLoaded;
    _isLoggedInPageLoaded;
    constructor(glToken, profileId, email, password, mailFowarded) {
        this._email = email;
        this._password = password;
        this._mailForwarded = mailFowarded;
        this._glToken = glToken;
        this._profileId = profileId;

        this._glBroker = new GoLoginBroker(glToken, profileId)
        this._userAgentSettingString = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.33 Safari/537.36";
        this._defaultPageHeight = 1080;
        this._defaultPageWidth = 1920;
        this._isLoggedInPageLoaded = false;
        this._isNoLoginPageLoaded = false;
    }

    async openBrowserAsync() {
        var connectionResult = await this._glBroker.openConnectionAsync();

        if(connectionResult.isSuccess == false) {
            console.log("An error was happened when initialized chrome instance...");
        }

        const browser = await puppeteer.connect({
            browserWSEndpoint: connectionResult.wsUrl.toString(),
            ignoreHTTPSErrors: true,
            defaultViewport: null
        });

        this._browser = browser;
    }

    async redirectToGmailPageAsync() {
        await this.redirectToPageAsync("https://gmail.com");
        await this.waitForEmailPageAllLoaded();
    }

    async waitForEmailPageAllLoaded() {
        const gmailNoLoginHeaderSelector = "div.feature__chapter__title";       // title nearest to the carousel on page
        const gmailHasLoggedInSelector = "div.UI";      // the messages container

        this._currentPage.setDefaultTimeout(20000);
        let noLoginPageNodeLoad = this._currentPage.waitForSelector(gmailNoLoginHeaderSelector)
            .then(() => {
                console.log("The Gmail home page has been loaded");
            });

        if(noLoginPageNodeLoad != null) {
            this._isNoLoginPageLoaded = true;
            return;
        }

        let loggedInPageNodeLoad = this._currentPage.waitForSelector(gmailHasLoggedInSelector)
        .then(() => {
            console.log("An account is storage on browser, the logged in page loaded!");
        });

        if(loggedInPageNodeLoad != null) {
            this._isNoLoginPageLoaded = true;
            return;
        }
    }

    
    async loginEmailAsync() {
        if(this._isNoLoginPageLoaded == true) {
            this.loginEmailFromHomePage();
        }
        else {
            this.loginEmailFromAccountPage();
        }
    }

    async loginEmailFromHomePage() {
        const loginBtnSelector = "a.button.button--medium.button--mobile-before-hero-only";
        const emailTextBoxSelector = "input[type=email]#identifierId";
        const passwordTextBoxSelector = "input[type=password]"
        let loginBtn = await this._currentPage.$(loginBtnSelector); // DOM
        
        if(loginBtn != null) {
            await loginBtn.tap()    // tap the center of element
        }

        await this._currentPage.waitForSelector(emailTextBoxSelector);
        await this._currentPage.waitFor(5000);    // wait for 5 seconds

        await this._currentPage.type(emailTextBoxSelector, this._email);
        await (await this._currentPage.$('div#identifierNext')).tap();    // tap next button

        let pwdDom = await this._currentPage.waitForSelector(passwordTextBoxSelector);
        if(pwdDom == null)
        { return; }

        await this._currentPage.waitFor(5000);    // wait for 5 seconds
        
        await this._currentPage.type(passwordTextBoxSelector, this._password);
        await (await this._currentPage.$('div#passwordNext')).tap();    // tap next button
    }


    async loginEmailFromAccountPage() {

    }

    async redirectToPageAsync(url) {
        if(this._browser.connected) {
            this.openBrowserAsync();
        }
        this._currentPage = await this._browser.newPage();
        await this._currentPage.setUserAgent(this._userAgentSettingString);
        // await this._currentPage.setViewport({width: this._defaultPageWidth, height: this._defaultPageHeight, deviceScaleFactor: 1});
        await this._currentPage.goto(url);
    }

    
    async startScript() {
        await this.openBrowserAsync();
        await this.redirectToGmailPageAsync();
        await this.loginEmailAsync()
    }
}


export default GLAutoForwardGmail;