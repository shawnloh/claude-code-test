import { createHash } from 'crypto';
import { get, run } from '@/lib/db';

export type Profile = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  deleted_at: string | null;
};

function rowToProfile(row: UserRow): Profile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deleted_at,
  };
}

export function getProfile(userId: string): Profile | null {
  const row = get<UserRow>(
    `SELECT id, name, email, image, createdAt, updatedAt, deleted_at FROM user WHERE id = ? AND deleted_at IS NULL`,
    [userId],
  );
  return row ? rowToProfile(row) : null;
}

export function updateProfile(
  userId: string,
  data: { name?: string; image?: string | null },
): Profile | null {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.image !== undefined) {
    fields.push('image = ?');
    values.push(data.image);
  }

  if (fields.length === 0) return getProfile(userId);

  const now = new Date().toISOString();
  fields.push('updatedAt = ?');
  values.push(now);
  values.push(userId);

  run(`UPDATE user SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`, values);

  return getProfile(userId);
}

export function getAvatarUrl(email: string, image: string | null, size = 80): string {
  if (image) return image;
  const hash = createHash('md5').update(email.trim().toLowerCase()).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}

export function softDeleteProfile(userId: string): void {
  const now = new Date().toISOString();
  run(`UPDATE user SET deleted_at = ? WHERE id = ?`, [now, userId]);
}
