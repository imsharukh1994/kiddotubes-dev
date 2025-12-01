const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  const out = { console: [], errors: [], requests: [] };
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  page.on('console', msg => {
    out.console.push({ type: msg.type(), text: msg.text() });
    console.log(`[PAGE ${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    out.errors.push({ message: err.message, stack: err.stack });
    console.error('[PAGE ERROR]', err.message);
  });

  page.on('requestfailed', req => {
    out.requests.push({ url: req.url(), status: 'failed', method: req.method(), failure: req.failure() });
    console.warn('[REQUEST FAILED]', req.url(), req.failure && req.failure().errorText);
  });

  page.on('response', async res => {
    try {
      const url = res.url();
      const status = res.status();
      if (url.includes('/api/config') || url.includes('/api/videos')) {
        const text = await res.text();
        out.requests.push({ url, status, text });
        console.log(`[RESPONSE ${status}] ${url}`);
      }
    } catch (e) {
      console.error('response read error', e.message);
    }
  });

  // Increase timeout for slow local startup
  await page.goto('http://localhost:8005', { waitUntil: 'networkidle2', timeout: 30000 })
    .catch(err => console.error('goto error', err && err.message));

  // Wait a bit for app to initialize and do XHR
  await new Promise(r => setTimeout(r, 4000));

  // Screenshot the page
  const screenshotPath = 'tools/frontend_screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Screenshot saved to', screenshotPath);

  // Save logs
  fs.writeFileSync('tools/frontend_console_log.json', JSON.stringify(out, null, 2));
  console.log('Console and network logs saved to tools/frontend_console_log.json');

  await browser.close();
})();
