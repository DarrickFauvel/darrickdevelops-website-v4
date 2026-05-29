const VIEWPORTS = {
  desktop: { width: 1280, height: 800  },
  tablet:  { width: 768,  height: 1024 },
  mobile:  { width: 390,  height: 844  },
};

async function cloudinaryUpload(imageBuffer, publicId) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials not configured');
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder    = 'projects';
  const sigString = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;

  const { createHash } = await import('crypto');
  const signature = createHash('sha256').update(sigString).digest('hex');

  const form = new FormData();
  form.append('file', new Blob([imageBuffer], { type: 'image/png' }), `${publicId}.png`);
  form.append('public_id',  publicId);
  form.append('folder',     folder);
  form.append('timestamp',  timestamp);
  form.append('api_key',    CLOUDINARY_API_KEY);
  form.append('signature',  signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: form }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.secure_url;
}

export async function screenshotUrl(url, slug, viewport = 'desktop') {
  const { width, height } = VIEWPORTS[viewport] ?? VIEWPORTS.desktop;
  const apiUrl = `https://image.thum.io/get/width/${width}/viewportWidth/${width}/crop/${height}/${url}`;

  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`Screenshot fetch failed: ${res.status}`);

  const buf      = Buffer.from(await res.arrayBuffer());
  const publicId = `${slug}-${viewport}`;
  return cloudinaryUpload(buf, publicId);
}
