import { db } from '../client.js';

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboardCounts() {
  const [p, c, b, m] = await Promise.all([
    db.execute('SELECT COUNT(*) AS count FROM projects'),
    db.execute('SELECT COUNT(*) AS count FROM fm_challenges'),
    db.execute('SELECT COUNT(*) AS count FROM posts'),
    db.execute('SELECT COUNT(*) AS count FROM contact_messages'),
  ]);
  return {
    projects:   Number(p.rows[0].count),
    challenges: Number(c.rows[0].count),
    posts:      Number(b.rows[0].count),
    messages:   Number(m.rows[0].count),
  };
}

export async function getRecentMessages(limit = 10) {
  const { rows } = await db.execute({
    sql:  'SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ?',
    args: [limit],
  });
  return rows;
}

// ── Projects ──────────────────────────────────────────────────────────────────

export async function createProject(data) {
  await db.execute({
    sql: `INSERT INTO projects
            (title, slug, summary, description, tech_stack, challenges, solutions,
             features, live_url, repo_url, thumbnail_url, screenshots, status, featured)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.title, data.slug, data.summary, data.description ?? null,
      data.tech_stack, data.challenges ?? null, data.solutions ?? null,
      data.features, data.live_url ?? null, data.repo_url ?? null,
      data.thumbnail_url ?? null, data.screenshots, data.status, data.featured,
    ],
  });
}

export async function updateProject(id, data) {
  await db.execute({
    sql: `UPDATE projects SET
            title=?, slug=?, summary=?, description=?, tech_stack=?, challenges=?,
            solutions=?, features=?, live_url=?, repo_url=?, thumbnail_url=?,
            screenshots=?, status=?, featured=?
          WHERE id=?`,
    args: [
      data.title, data.slug, data.summary, data.description ?? null,
      data.tech_stack, data.challenges ?? null, data.solutions ?? null,
      data.features, data.live_url ?? null, data.repo_url ?? null,
      data.thumbnail_url ?? null, data.screenshots, data.status, data.featured,
      id,
    ],
  });
}

export async function deleteProject(id) {
  await db.execute({ sql: 'DELETE FROM projects WHERE id=?', args: [id] });
}

export async function updateThumbnailUrl(id, thumbnailUrl) {
  await db.execute({
    sql:  'UPDATE projects SET thumbnail_url=? WHERE id=?',
    args: [thumbnailUrl, id],
  });
}

// ── FM Challenges ─────────────────────────────────────────────────────────────

export async function createChallenge(data) {
  await db.execute({
    sql: `INSERT INTO fm_challenges
            (title, slug, difficulty, tech_stack, solution_url, repo_url,
             fm_url, screenshot_url, notes, featured, completed_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.title, data.slug, data.difficulty, data.tech_stack,
      data.solution_url ?? null, data.repo_url ?? null, data.fm_url ?? null,
      data.screenshot_url ?? null, data.notes ?? null,
      data.featured, data.completed_at ?? null,
    ],
  });
}

export async function updateChallenge(id, data) {
  await db.execute({
    sql: `UPDATE fm_challenges SET
            title=?, slug=?, difficulty=?, tech_stack=?, solution_url=?, repo_url=?,
            fm_url=?, screenshot_url=?, notes=?, featured=?, completed_at=?
          WHERE id=?`,
    args: [
      data.title, data.slug, data.difficulty, data.tech_stack,
      data.solution_url ?? null, data.repo_url ?? null, data.fm_url ?? null,
      data.screenshot_url ?? null, data.notes ?? null,
      data.featured, data.completed_at ?? null,
      id,
    ],
  });
}

export async function deleteChallenge(id) {
  await db.execute({ sql: 'DELETE FROM fm_challenges WHERE id=?', args: [id] });
}

// ── Blog Posts ────────────────────────────────────────────────────────────────

export async function createPost(data) {
  const publishedAt = data.published ? new Date().toISOString() : null;
  await db.execute({
    sql: `INSERT INTO posts (title, slug, excerpt, body, tags, published, published_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      data.title, data.slug, data.excerpt ?? null, data.body ?? null,
      data.tags, data.published, publishedAt,
    ],
  });
}

export async function updatePost(id, data) {
  await db.execute({
    sql: `UPDATE posts SET title=?, slug=?, excerpt=?, body=?, tags=?, published=?, published_at=?
          WHERE id=?`,
    args: [
      data.title, data.slug, data.excerpt ?? null, data.body ?? null,
      data.tags, data.published, data.published_at ?? null,
      id,
    ],
  });
}

export async function deletePost(id) {
  await db.execute({ sql: 'DELETE FROM posts WHERE id=?', args: [id] });
}

export async function publishPost(id) {
  await db.execute({
    sql:  "UPDATE posts SET published=1, published_at=datetime('now') WHERE id=?",
    args: [id],
  });
}

export async function unpublishPost(id) {
  await db.execute({
    sql:  'UPDATE posts SET published=0, published_at=NULL WHERE id=?',
    args: [id],
  });
}

// ── Contact ───────────────────────────────────────────────────────────────────

export async function getAllMessages() {
  const { rows } = await db.execute(
    'SELECT * FROM contact_messages ORDER BY created_at DESC'
  );
  return rows;
}

export async function deleteMessage(id) {
  await db.execute({ sql: 'DELETE FROM contact_messages WHERE id=?', args: [id] });
}
