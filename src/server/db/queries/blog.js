import { db } from '../client.js';

export async function getPublishedPosts(limit = 10) {
  const { rows } = await db.execute({
    sql:  'SELECT * FROM posts WHERE published = 1 ORDER BY published_at DESC LIMIT ?',
    args: [limit],
  });
  return rows;
}

export async function getPostBySlug(slug) {
  const { rows } = await db.execute({
    sql:  'SELECT * FROM posts WHERE slug = ? AND published = 1',
    args: [slug],
  });
  return rows[0] ?? null;
}
