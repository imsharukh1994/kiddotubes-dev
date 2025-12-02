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

  await page.goto('http://localhost:8005', { waitUntil: 'networkidle2', timeout: 30000 })
    .catch(err => console.error('goto error', err && err.message));

  // Wait for init
  await new Promise(r => setTimeout(r, 2000));

  // Try clicking Google sign-in button
  const btn = await page.$('#googleSignInBtn');
  if (!btn) {
    console.error('Google sign-in button not found');
  } else {
    console.log('Clicking Google sign-in button...');
    await btn.click().catch(e => console.error('Click error', e && e.message));
  }

  // Wait for 6 seconds to capture popup errors
  await new Promise(r => setTimeout(r, 6000));

  // Save logs
  fs.writeFileSync('tools/frontend_google_console_log.json', JSON.stringify(out, null, 2));
  console.log('Saved google test logs to tools/frontend_google_console_log.json');

  await browser.close();
})();
