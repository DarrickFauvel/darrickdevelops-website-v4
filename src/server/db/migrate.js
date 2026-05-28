import 'dotenv/config';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db } from './client.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schema = await readFile(join(__dirname, 'schema.sql'), 'utf8');

for (const stmt of schema.split(';').map(s => s.trim()).filter(Boolean)) {
  await db.execute(stmt);
}

console.log('Migration complete.');
