import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { updateNote, deleteNote } from '@/lib/notes';

const MAX_TITLE_LENGTH = 500;
const MAX_CONTENT_SIZE = 1_000_000;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);

  if (!body || typeof body.title !== 'string' || typeof body.content_json !== 'string') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { title, content_json, is_public } = body;

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

  const isPublic = typeof is_public === 'boolean' ? is_public : undefined;
  const updated = updateNote(session.user.id, id, title, content_json, isPublic);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  deleteNote(session.user.id, id);
  return new NextResponse(null, { status: 204 });
}
