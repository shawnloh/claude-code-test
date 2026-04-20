import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getProfile, updateProfile, softDeleteProfile } from '@/lib/profile';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profile = getProfile(session.user.id);
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, image } = body as { name?: unknown; image?: unknown };

  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    return NextResponse.json({ error: 'Name must be a non-empty string' }, { status: 400 });
  }
  if (image !== undefined && image !== null && typeof image !== 'string') {
    return NextResponse.json({ error: 'Image must be a string or null' }, { status: 400 });
  }

  const updated = updateProfile(session.user.id, {
    name: typeof name === 'string' ? name.trim() : undefined,
    image: image as string | null | undefined,
  });

  if (!updated) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  softDeleteProfile(session.user.id);

  // Sign out the user after soft-deleting the account
  await auth.api.signOut({ headers: await headers() });

  return new NextResponse(null, { status: 204 });
}
