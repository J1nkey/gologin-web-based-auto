import puppeteer from "puppeteer-core";

import GoLoginBroker from "./gologin-broker.js";
import { AccountDisabledException, VerifyAccountException, PasswordChangedException } from "./errors/custom-errors.js"

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

        if (connectionResult.isSuccess == false) {
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

        let noLoginPageNodeLoad = await this._currentPage.waitForSelector(gmailNoLoginHeaderSelector, {timeout: 10000})
            .then(() => {
                console.log("The Gmail home page has been loaded");
				this._isNoLoginPageLoaded = true;
            })
			.catch(error => {
				console.log("Current page is not home page, trying to test ");
				return;
			});

        if (this._isNoLoginPageLoaded == true) {
            return;
        }

		let isRedirectToSignInPage = 
			await this._currentPage.waitForSelector('input[type=email]#identifierId', {timeout: 20000})
			.then(() => {
				console.log('The sign in page is loaded!!!');
				this._isNoLoginPageLoaded = true;
			})
			.catch(err => {
				console.log("Error to select the selector, maybe selector is not exist or visible in current page");
			});
		
		if(this._isNoLoginPageLoaded == true) {
			return;
		}

        let loggedInPageNodeLoad = await this._currentPage.waitForSelector(gmailHasLoggedInSelector, {timeout: 20000})
        .then(() => {
            console.log("An account is storage on browser, the logged in page loaded!");
            this._isNoLoginPageLoaded = true;
        })
		.catch(err => {
			console.log("Error to select the selector, maybe selector is not exist or visible");
			return;
		});

        if (this._isNoLoginPageLoaded == true) {
            return;
        }
    }
    
    async loginEmailAsync() {
        if (this._isNoLoginPageLoaded == true) {
            try {
                await this.loginEmailFromHomePageAsync();
            }
            catch (e) {
                console.log(`Error: ${e.message}`);
                throw e;
            }
        }
        else {
            this.loginEmailFromAccountPageAsync();
        }
    }

    async loginEmailFromHomePageAsync() {
        const loginBtnSelector = "a.button.button--medium.button--mobile-before-hero-only";
        const emailTextBoxSelector = "input[type=email]#identifierId";
        const passwordTextBoxSelector = "input[type=password]"
        let loginBtn = await this._currentPage.$(loginBtnSelector); // DOM
        
        if (loginBtn != null) {
            await loginBtn.tap()    // tap the center of element
        }

        await this._currentPage.waitForSelector(emailTextBoxSelector, {timeout: 15000, visible: true});
        await this._currentPage.waitFor(5000);    // wait for 5 seconds

        await this._currentPage.type(emailTextBoxSelector, this._email);
        await (await this._currentPage.$('div#identifierNext')).tap();    // tap next button

        // check verify after type in the account name
        let verifyHeaderTextXpath = '//span[@jsslot][contains(text(), "Verify it’s you")]';
        // let verifyContentXpath = '//span[@jsslot][contains(text(), "To help keep your account safe, Google wants to make sure")]';
        
        // throw an exception if there is a verify process 
        if((await this._currentPage.$x(verifyHeaderTextXpath)).length > 0) {
            throw new VerifyAccountException('A verify process happens after type in username');
        }

        let pwdDom = await this._currentPage.waitForSelector(passwordTextBoxSelector, {timeout: 15000, visible: true});
        if (pwdDom == null)
        { return; }

        await this._currentPage.waitFor(5000);    // wait for 5 seconds
        await this._currentPage.type(passwordTextBoxSelector, this._password);
        await (await this._currentPage.$('div#passwordNext')).tap();    // tap next button

        await this._currentPage.waitFor(5000);
        // checking password was changed or not
        let passwordChangedNotifyXpath = '//span[@jsslot][contains(text(), "Your password was changed")]';
        let alertElements = await this._currentPage.$x(passwordChangedNotifyXpath);
        if(alertElements.length > 0) {
            throw new PasswordChangedException();
        }

        await this.handleCloseGoogleAlerts();
        await this.closeIntroduceSiteIfExists()
    }

    async loginEmailFromAccountPage() {

    }

    async handleCloseGoogleAlerts() {
        let accountDisabledXpath = '//span[@jsslot][contains(text(), "Your account has been disabled")]';
        if(await this._currentPage.$x(accountDisabledXpath) != null) {
            throw new AccountDisabledException("The signed in account has been disabled");
        }
    }

    async redirectToPageAsync(url) {
        if (this._browser.connected) {
            this.openBrowserAsync();
        }
        this._currentPage = await this._browser.newPage();
        await this._currentPage.setUserAgent(this._userAgentSettingString);
        // await this._currentPage.setViewport({ 
        //     // width: this._defaultPageWidth, 
        //     // height: this._defaultPageHeight, 
        //     width: 640,
        //     height: 480,
        //     deviceScaleFactor: 1
        // });

        await this._currentPage.goto(url);
    }

    async closeIntroduceSiteIfExists() {
        await this._currentPage.waitFor(10000);
        let searchText = "You’re signed in";
        const [element] = await this._currentPage.$x(`//*[contains(text(), "${searchText}")]`)

        if (element) {
            let xpath = "//a[text()='Not now']";
            var matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            
            if (matchingElement != null) {
                const event = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                matchingElement.dispatchEvent(event);
            }
        }
    }

    async OpenMailForwardSetting() {
        await this._currentPage.goto("https://mail.google.com/mail/u/0/#settings/fwdandpop");
        await this._currentPage.waitForSelector("input[type=\"button\"][value=\"Add a forwarding address\"]", { visible: true });

        let searchText = "Enable POP for";
        var matchingElement = await this._currentPage.$x(`//*[contains(text(), "${searchText}")]`)

        if (matchingElement != null) {
           
        }
        var btnAddMailForward = await this._currentPage.$("input[type=\"button\"][value=\"Add a forwarding address\"]");
        await btnAddMailForward.tap();

		let typeForwardEmailDialogXpath = `//div[contains(text(), "Please enter a new forwarding email address")]`;
		await this._currentPage.waitForXPath(typeForwardEmailDialogXpath, {visible: true, timeout: 30000});
        await this._currentPage.waitFor(3000);

        await this._currentPage.type("input[type=text]", this._mailForwarded);
        await (await this._currentPage.$("button[name=\"next\"]")).tap();

		// Verify state
		this.verifyAccount();

        // Enable IMAP & POP action
        let imapSelector = "label[for=\":jw\"]";
        let imapSelectorXpath = `//label[contains(text(), "Enable IMAP")]`;

        let popSelector = "label[for=\":1l\"]";
        let popSelectorXpath = `//label[contains(., 'Enable POP for all mail') and span[contains(text(), 'all mail')]]`;

		await this._currentPage.waitForXPath(imapSelectorXpath, {timeout: 30000});
        let popSearchingResult = await this._currentPage.$x(popSelectorXpath);
        if (popSearchingResult) {
            await popSearchingResult[0].click();
        }
        let imapSearchingResult = await this._currentPage.$x(imapSelectorXpath);
        if (imapSearchingResult) {
            await imapSearchingResult[0].click();
        }

        await this._currentPage.waitFor(2000);
        let btnSave = await this._currentPage.$("button[guidedhelpid=\"save_changes_button\"]");
        await btnSave.click();

        await this._currentPage.waitFor(5000);
        await this.HandleForwardVerify();
    }

    async HandleForwardVerify() {
        const verifyText = "We need to verify it's you to continue";
        const btnVerifyContinueXpath = "//span[@jsname=\"V67aGc\"][@class=\"mUIrbf-anl\"][contains(text(), \"Continue\")]"
        const verifyWentWrong = "An error occurred with the secure Google verification. Try again later.";

        let verifyPanel = await this._currentPage.$x(`//div[@id=\"c3\"][contains(text(), \"${verifyText}\")]`);
        if (verifyPanel) {
            const pageTarget = this._currentPage.target();
            await (await this._currentPage.$x(btnVerifyContinueXpath))[0].click()
            const newTarget = await this._browser.waitForTarget(target => target.opener() === pageTarget);
            const newPage = await newTarget.page();

            try {
                if (!(await newPage.waitForXPath(
                    `//span[contains(text(), \"Google wants to make sure it's really you trying to enable IMAP access in Gmail.\")]`))) {
                        return;
                }
            }
            catch (e) {
                console.log(e);
            }
        }
    }

    async startScript() {
        try {
            await this.openBrowserAsync();
            await this.redirectToGmailPageAsync();
            await this.loginEmailAsync();
            await this.OpenMailForwardSetting();
        }
        catch(e) {
            console.log(`Error: Process failure!`);
        }
    }
}


export default GLAutoForwardGmail;