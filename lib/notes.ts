import { query, get, run } from '@/lib/db';

export type Note = {
  id: string;
  userId: string;
  title: string;
  contentJson: string;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
};

type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    contentJson: row.content_json,
    isPublic: row.is_public === 1,
    publicSlug: row.public_slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getNotesByUser(
  userId: string,
  limit = 20,
  offset = 0,
): { notes: Note[]; total: number } {
  const rows = query<NoteRow>(
    `SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
    [userId, limit, offset],
  );
  const countRow = get<{ count: number }>(`SELECT COUNT(*) as count FROM notes WHERE user_id = ?`, [
    userId,
  ]);
  return { notes: rows.map(rowToNote), total: countRow?.count ?? 0 };
}

export function getNoteById(userId: string, noteId: string): Note | null {
  const row = get<NoteRow>(`SELECT * FROM notes WHERE id = ? AND user_id = ?`, [noteId, userId]);
  return row ? rowToNote(row) : null;
}

export function updateNote(
  userId: string,
  noteId: string,
  title: string,
  contentJson: string,
  isPublic?: boolean,
): Note | null {
  const now = new Date().toISOString();

  if (isPublic === undefined) {
    run(
      `UPDATE notes SET title = ?, content_json = ?, updated_at = ? WHERE id = ? AND user_id = ?`,
      [title, contentJson, now, noteId, userId],
    );
  } else if (isPublic) {
    // Enable sharing: generate slug only if one doesn't already exist
    const existing = getNoteById(userId, noteId);
    const slug = existing?.publicSlug ?? crypto.randomUUID();
    run(
      `UPDATE notes SET title = ?, content_json = ?, is_public = 1, public_slug = ?, updated_at = ? WHERE id = ? AND user_id = ?`,
      [title, contentJson, slug, now, noteId, userId],
    );
  } else {
    // Disable sharing: clear slug
    run(
      `UPDATE notes SET title = ?, content_json = ?, is_public = 0, public_slug = NULL, updated_at = ? WHERE id = ? AND user_id = ?`,
      [title, contentJson, now, noteId, userId],
    );
  }

  return getNoteById(userId, noteId);
}

export function deleteNote(userId: string, noteId: string): void {
  run(`DELETE FROM notes WHERE id = ? AND user_id = ?`, [noteId, userId]);
}

export function getNoteBySlug(slug: string): Note | null {
  const row = get<NoteRow>(`SELECT * FROM notes WHERE public_slug = ? AND is_public = 1`, [slug]);
  return row ? rowToNote(row) : null;
}
