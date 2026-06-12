import 'dotenv/config';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db } from './client.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schema = await readFile(join(__dirname, 'schema.sql'), 'utf8');

for (const stmt of schema.split(';').map(s => s.trim()).filter(Boolean)) {
  try {
    await db.execute(stmt);
  } catch (err) {
    if (err.message?.includes('duplicate column')) continue;
    throw err;
  }
}

// Additive column migrations
const alterations = [
  'ALTER TABLE projects ADD COLUMN original_thumbnail_url TEXT',
  'ALTER TABLE projects ADD COLUMN thumbnail_frame TEXT',
  'ALTER TABLE projects ADD COLUMN thumbnail_offset_x REAL',
  'ALTER TABLE projects ADD COLUMN thumbnail_offset_y REAL',
  'ALTER TABLE projects ADD COLUMN thumbnail_zoom_exp REAL',
  'ALTER TABLE projects ADD COLUMN thumbnail_rotation REAL',
];
for (const stmt of alterations) {
  try { await db.execute(stmt); } catch { /* already exists */ }
}

console.log('Migration complete.');
