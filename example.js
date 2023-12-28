import puppeteer from 'puppeteer-core';
import GoLogin from './src/gologin.js';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NThhOTdlMDgwNDAxMjZkYzAxNDdiNmEiLCJ0eXBlIjoiZGV2Iiwiand0aWQiOiI2NThhOWI5MGY0Y2QzYWNhOWZhNTY2NjkifQ.VKCW2u0iGCrVlDjlGCv-b3kyHBKAG5s_wOjVjM3jH6A';
const profile_id = '658be25226117012fd27f446';

(async () => {
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
  await page.goto('https://myip.link/mini');
  console.log(await page.content());
//   await browser.close();
//   await GL.stop();
})();
