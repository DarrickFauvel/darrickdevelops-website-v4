import { db } from '../client.js';

function parse(row) {
  return { ...row, tech_stack: JSON.parse(row.tech_stack ?? '[]') };
}

export async function getFeaturedChallenges() {
  const { rows } = await db.execute(
    'SELECT * FROM fm_challenges WHERE featured = 1 ORDER BY completed_at DESC'
  );
  return rows.map(parse);
}

export async function getAllChallenges() {
  const { rows } = await db.execute(
    'SELECT * FROM fm_challenges ORDER BY completed_at DESC'
  );
  return rows.map(parse);
}

export async function getChallengeBySlug(slug) {
  const { rows } = await db.execute({
    sql:  'SELECT * FROM fm_challenges WHERE slug = ?',
    args: [slug],
  });
  return rows[0] ? parse(rows[0]) : null;
}

export async function getChallengeById(id) {
  const { rows } = await db.execute({
    sql:  'SELECT * FROM fm_challenges WHERE id = ?',
    args: [id],
  });
  return rows[0] ? parse(rows[0]) : null;
}
