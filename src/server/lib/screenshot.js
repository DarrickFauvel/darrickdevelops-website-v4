import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const THUMBNAILS_DIR = join(__dirname, '../../public/images/thumbnails');

export async function screenshotUrl(url, slug) {
  await mkdir(THUMBNAILS_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const filename = `${slug}.png`;
    await page.screenshot({ path: join(THUMBNAILS_DIR, filename), type: 'png' });
    return `/images/thumbnails/${filename}`;
  } finally {
    await browser.close();
  }
}
