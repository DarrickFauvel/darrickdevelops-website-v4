import { db } from '../client.js';

function parse(row) {
  return {
    ...row,
    tech_stack:  JSON.parse(row.tech_stack  ?? '[]'),
    features:    JSON.parse(row.features    ?? '[]'),
    screenshots: JSON.parse(row.screenshots ?? '[]'),
  };
}

export async function getFeaturedProjects() {
  const { rows } = await db.execute(
    'SELECT * FROM projects WHERE featured = 1 ORDER BY created_at DESC'
  );
  return rows.map(parse);
}

export async function getAllProjects() {
  const { rows } = await db.execute(
    'SELECT * FROM projects ORDER BY created_at DESC'
  );
  return rows.map(parse);
}

export async function getProjectBySlug(slug) {
  const { rows } = await db.execute({
    sql:  'SELECT * FROM projects WHERE slug = ?',
    args: [slug],
  });
  return rows[0] ? parse(rows[0]) : null;
}
