// const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NThhOTdlMDgwNDAxMjZkYzAxNDdiNmEiLCJ0eXBlIjoiZGV2Iiwiand0aWQiOiI2NThhOWI5MGY0Y2QzYWNhOWZhNTY2NjkifQ.VKCW2u0iGCrVlDjlGCv-b3kyHBKAG5s_wOjVjM3jH6A';
// const profile_id = '658be25226117012fd27f446';
import puppeteer from "puppeteer-core";
import GoLogin from './src/gologin.js';


(async () => {
    var index = 1;
    var argv = (process.argv.slice(2));
    const token = argv[index]
    const profile_id = argv[index+=2]

    const GL = new GoLogin({
        token,
        profile_id,
    });
    
    const { status, wsUrl } = await GL.start().catch((e) => {
        console.trace(e);
        return { status: 'failure' };
    });

    if (status !== 'success') {
        console.log('Invalid status');
        return;
    }

    const browser = await puppeteer.connect({
        browserWSEndpoint: wsUrl.toString(),
        ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    // console.log(await page.content());

    // Navigate the page to a URL
    await page.goto('https://youtube.com/');

    // Set screen size
    await page.setViewport({width: 1920, height: 1080});
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.33 Safari/537.36');


    // // Wait and click on first result
    const searchResultSelector = 'input#search';
    await page.waitForSelector(searchResultSelector);

    // Type into search box
    await page.type('input#search', 'ncs');
})();
