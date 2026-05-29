import { createHash } from 'crypto';

// Stored value is a Cloudinary public_id when it doesn't look like a URL
export function isCloudinaryId(v) {
  return typeof v === 'string' && v.length > 0 && !v.startsWith('http');
}

export function signedUrl(publicId) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_SECRET } = process.env;
  const sig = createHash('sha256')
    .update(publicId + CLOUDINARY_API_SECRET)
    .digest('hex')
    .slice(0, 8);
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/private/s--${sig}--/${publicId}`;
}

export function resolveUrl(stored) {
  if (!stored) return null;
  return isCloudinaryId(stored) ? signedUrl(stored) : stored;
}

export const UPLOAD_FOLDER = 'projects';

export async function uploadBuffer(buffer, slug, viewport) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials not configured');
  }

  const publicId  = `${slug}-${viewport}`;
  const folder    = UPLOAD_FOLDER;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const sigString = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}&type=private${CLOUDINARY_API_SECRET}`;
  const signature = createHash('sha256').update(sigString).digest('hex');

  const form = new FormData();
  form.append('file',       new Blob([buffer], { type: 'image/png' }), `${publicId}.png`);
  form.append('public_id',  publicId);
  form.append('folder',     folder);
  form.append('type',       'private');
  form.append('timestamp',  timestamp);
  form.append('api_key',    CLOUDINARY_API_KEY);
  form.append('signature',  signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: form }
  );
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`);
  return `${folder}/${publicId}`;
}

export async function deleteAsset(publicId) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const sigString = `public_id=${publicId}&timestamp=${timestamp}&type=private${CLOUDINARY_API_SECRET}`;
  const signature = createHash('sha256').update(sigString).digest('hex');

  const form = new URLSearchParams({
    public_id: publicId, type: 'private', timestamp, api_key: CLOUDINARY_API_KEY, signature,
  });
  await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
    { method: 'POST', body: form }
  );
}

export function hydrateProject(project) {
  if (!project) return null;
  return {
    ...project,
    thumbnail_url: resolveUrl(project.thumbnail_url),
    screenshots:   (project.screenshots || []).map(resolveUrl).filter(Boolean),
  };
}
