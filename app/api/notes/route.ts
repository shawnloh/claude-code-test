import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { run } from '@/lib/db';
import { getNotesByUser } from '@/lib/notes';

const PAGE_SIZE = 20;
const MAX_TITLE_LENGTH = 500;
const MAX_CONTENT_SIZE = 1_000_000; // 1 MB

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const { notes, total } = getNotesByUser(session.user.id, PAGE_SIZE, offset);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return NextResponse.json({
    notes: notes.map(({ id, title, isPublic, updatedAt }) => ({ id, title, isPublic, updatedAt })),
    total,
    page,
    totalPages,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.title !== 'string' || typeof body.content_json !== 'string') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { title, content_json } = body;

  if (title.length === 0 || title.length > MAX_TITLE_LENGTH) {
    return NextResponse.json(
      { error: 'Title must be between 1 and 500 characters' },
      { status: 400 },
    );
  }

  if (content_json.length > MAX_CONTENT_SIZE) {
    return NextResponse.json({ error: 'Content too large' }, { status: 400 });
  }

  try {
    JSON.parse(content_json);
  } catch {
    return NextResponse.json({ error: 'content_json must be valid JSON' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    run(
      `INSERT INTO notes (id, user_id, title, content_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, session.user.id, title, content_json, now, now],
    );
  } catch {
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
  }

  return NextResponse.json({ id }, { status: 201 });
}
