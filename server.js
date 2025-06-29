// 📁 server.js

const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/get-player-name', async (req, res) => {
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ error: 'UID is required' });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto('https://shop.garena.sg/app');

    await page.waitForSelector('input[name="playerId"]', { timeout: 5000 });
    await page.type('input[name="playerId"]', uid);

    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const name = await page.evaluate(() => {
      const el = document.querySelector('.user-info .name');
      return el ? el.innerText : 'Name not found';
    });

    await browser.close();
    res.json({ uid, name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch name', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
