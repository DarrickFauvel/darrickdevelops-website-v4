import { Eta } from 'eta';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const eta = new Eta({
  views: join(__dirname, '../../views'),
  cache: process.env.NODE_ENV === 'production',
});

export async function render(res, template, data = {}) {
  const html = await eta.renderAsync(template, data);
  res.send(html);
}
