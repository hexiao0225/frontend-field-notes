import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshotsDir = join(__dirname, '..', 'public', 'screenshots');

const URL = 'https://component-playground-xi.vercel.app';

async function captureScreenshots() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Set viewport for consistent screenshots
  await page.setViewport({ width: 1280, height: 900 });

  // Navigate to the page
  await page.goto(URL, { waitUntil: 'networkidle0' });

  // Wait for content to load
  await page.waitForSelector('h1');
  await new Promise(r => setTimeout(r, 500));

  // Full page hero shot
  await page.screenshot({
    path: join(screenshotsDir, 'hero.png'),
    clip: { x: 0, y: 0, width: 1280, height: 800 }
  });
  console.log('✓ Captured hero screenshot');

  // Get all demo sections
  const sections = await page.$$('section');
  console.log(`Found ${sections.length} sections`);

  const sectionNames = ['skeleton', 'tabs', 'dropdown', 'modal', 'toast', 'form'];

  for (let i = 0; i < Math.min(sections.length, sectionNames.length); i++) {
    const section = sections[i];
    await section.scrollIntoView();
    await new Promise(r => setTimeout(r, 200));
    await section.screenshot({
      path: join(screenshotsDir, `${sectionNames[i]}.png`)
    });
    console.log(`✓ Captured ${sectionNames[i]} demo`);
  }

  // Open a modal and capture it
  const buttons = await page.$$('button');
  let modalButton = null;
  for (const btn of buttons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Open Modal')) {
      modalButton = btn;
      break;
    }
  }

  if (modalButton) {
    await modalButton.click();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({
      path: join(screenshotsDir, 'modal-open.png'),
    });
    console.log('✓ Captured open modal');
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 200));
  }

  // Trigger toasts
  const allButtons = await page.$$('button');
  for (const btn of allButtons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text === 'Success') {
      await btn.click();
      await new Promise(r => setTimeout(r, 150));
    }
    if (text === 'Error') {
      await btn.click();
      await new Promise(r => setTimeout(r, 150));
    }
    if (text === 'Info') {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({
    path: join(screenshotsDir, 'toasts.png'),
  });
  console.log('✓ Captured toast notifications');

  await browser.close();
  console.log('\n✅ All screenshots captured!');
}

captureScreenshots().catch(console.error);
