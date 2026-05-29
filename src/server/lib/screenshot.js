import { uploadBuffer } from './cloudinary.js';

const VIEWPORTS = {
  desktop: { width: 1280, height: 800  },
  tablet:  { width: 768,  height: 1024 },
  mobile:  { width: 390,  height: 660  },
};

export async function screenshotUrl(url, slug, viewport = 'desktop') {
  const { width, height } = VIEWPORTS[viewport] ?? VIEWPORTS.desktop;
  const apiUrl = `https://image.thum.io/get/width/${width}/viewportWidth/${width}/crop/${height}/${url}`;

  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`Screenshot fetch failed: ${res.status}`);

  const buf = Buffer.from(await res.arrayBuffer());
  return uploadBuffer(buf, slug, viewport);
}
