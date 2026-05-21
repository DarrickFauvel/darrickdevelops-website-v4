import { db } from '../client.js';

export async function saveMessage({ name, email, subject, message }) {
  await db.execute({
    sql:  'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
    args: [name, email, subject ?? '', message],
  });
}
