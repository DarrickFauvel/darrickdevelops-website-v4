import 'dotenv/config';
import { db } from './client.js';

await db.execute(`
  INSERT OR IGNORE INTO projects (title, slug, summary, tech_stack, featured, status)
  VALUES
    ('Project One',   'project-one',   'A full-stack web app — description coming soon.', '["Node.js","Turso","Datastar","Express"]',    1, 'in-progress'),
    ('Project Two',   'project-two',   'A full-stack web app — description coming soon.', '["HTML","CSS","JavaScript","Web Components"]', 1, 'in-progress'),
    ('Project Three', 'project-three', 'A full-stack web app — description coming soon.', '["SSE","Eta","Railway","LibSQL"]',             1, 'in-progress')
`);

console.log('Seed complete.');
