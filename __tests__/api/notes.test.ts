import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing route handlers
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@/lib/db', () => ({
  run: vi.fn(),
  query: vi.fn(),
  get: vi.fn(),
}));

vi.mock('@/lib/notes', () => ({
  getNotesByUser: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
}));

import { auth } from '@/lib/auth';
import { run } from '@/lib/db';
import { getNotesByUser, updateNote, deleteNote } from '@/lib/notes';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/notes/route';
import { PATCH, DELETE } from '@/app/api/notes/[id]/route';

const mockGetSession = vi.mocked(auth.api.getSession);
const mockRun = vi.mocked(run);
const mockGetNotesByUser = vi.mocked(getNotesByUser);
const mockUpdateNote = vi.mocked(updateNote);
const mockDeleteNote = vi.mocked(deleteNote);

const fakeSession = { user: { id: 'user-1' } };

function makeRequest(method: string, body?: unknown, searchParams?: Record<string, string>) {
  const url = new URL(
    `http://localhost/api/notes${searchParams ? '?' + new URLSearchParams(searchParams) : ''}`,
  );
  return new NextRequest(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── GET /api/notes ───────────────────────────────────────────────────────────

describe('GET /api/notes', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await GET(makeRequest('GET'));

    expect(res.status).toBe(401);
  });

  it('returns paginated notes for authenticated user', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockGetNotesByUser.mockReturnValue({
      notes: [
        {
          id: 'n1',
          userId: 'user-1',
          title: 'Note 1',
          contentJson: '{}',
          isPublic: false,
          publicSlug: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      total: 1,
    });

    const res = await GET(makeRequest('GET'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.notes).toHaveLength(1);
    expect(json.total).toBe(1);
    expect(json.totalPages).toBe(1);
    // Only id, title, isPublic, updatedAt are returned (not contentJson)
    expect(json.notes[0]).not.toHaveProperty('contentJson');
  });

  it('defaults to page 1 when no page param', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockGetNotesByUser.mockReturnValue({ notes: [], total: 0 });

    await GET(makeRequest('GET'));

    expect(mockGetNotesByUser).toHaveBeenCalledWith('user-1', 20, 0);
  });

  it('calculates correct offset for page 2', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockGetNotesByUser.mockReturnValue({ notes: [], total: 0 });

    await GET(makeRequest('GET', undefined, { page: '2' }));

    expect(mockGetNotesByUser).toHaveBeenCalledWith('user-1', 20, 20);
  });
});

// ─── POST /api/notes ──────────────────────────────────────────────────────────

describe('POST /api/notes', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await POST(makeRequest('POST', { title: 'Hi', content_json: '{}' }));

    expect(res.status).toBe(401);
  });

  it('creates a note and returns 201 with id and publicSlug', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockRun.mockReturnValue(undefined);

    const res = await POST(
      makeRequest('POST', { title: 'My Note', content_json: '{"type":"doc"}' }),
    );
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json).toHaveProperty('id');
    expect(json.publicSlug).toBeNull();
  });

  it('returns 400 when title is empty', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);

    const res = await POST(makeRequest('POST', { title: '', content_json: '{}' }));

    expect(res.status).toBe(400);
  });

  it('returns 400 when title exceeds 500 chars', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);

    const res = await POST(makeRequest('POST', { title: 'x'.repeat(501), content_json: '{}' }));

    expect(res.status).toBe(400);
  });

  it('returns 400 when content_json is not valid JSON', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);

    const res = await POST(makeRequest('POST', { title: 'Note', content_json: 'not-json' }));

    expect(res.status).toBe(400);
  });

  it('returns 400 when request body is malformed', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);

    const req = new NextRequest('http://localhost/api/notes', {
      method: 'POST',
      body: 'bad body',
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('sets publicSlug when is_public is true', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockRun.mockReturnValue(undefined);

    const res = await POST(
      makeRequest('POST', { title: 'Public Note', content_json: '{}', is_public: true }),
    );
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.publicSlug).not.toBeNull();
    expect(typeof json.publicSlug).toBe('string');
  });
});

// ─── PATCH /api/notes/[id] ────────────────────────────────────────────────────

describe('PATCH /api/notes/[id]', () => {
  const params = Promise.resolve({ id: 'note-1' });

  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await PATCH(makeRequest('PATCH', { title: 'T', content_json: '{}' }), { params });

    expect(res.status).toBe(401);
  });

  it('returns updated note on success', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockUpdateNote.mockReturnValue({
      id: 'note-1',
      userId: 'user-1',
      title: 'Updated',
      contentJson: '{}',
      isPublic: false,
      publicSlug: null,
      createdAt: '',
      updatedAt: '',
    });

    const res = await PATCH(makeRequest('PATCH', { title: 'Updated', content_json: '{}' }), {
      params,
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.title).toBe('Updated');
  });

  it('returns 404 when note not found', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockUpdateNote.mockReturnValue(null);

    const res = await PATCH(makeRequest('PATCH', { title: 'T', content_json: '{}' }), { params });

    expect(res.status).toBe(404);
  });

  it('returns 400 for empty title', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);

    const res = await PATCH(makeRequest('PATCH', { title: '', content_json: '{}' }), { params });

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid content_json', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);

    const res = await PATCH(makeRequest('PATCH', { title: 'T', content_json: '{bad}' }), {
      params,
    });

    expect(res.status).toBe(400);
  });

  it('passes is_public=true to updateNote', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockUpdateNote.mockReturnValue({
      id: 'note-1',
      userId: 'user-1',
      title: 'T',
      contentJson: '{}',
      isPublic: true,
      publicSlug: 'slug',
      createdAt: '',
      updatedAt: '',
    });

    await PATCH(makeRequest('PATCH', { title: 'T', content_json: '{}', is_public: true }), {
      params,
    });

    expect(mockUpdateNote).toHaveBeenCalledWith('user-1', 'note-1', 'T', '{}', true);
  });

  it('passes is_public=undefined when field is absent', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockUpdateNote.mockReturnValue({
      id: 'note-1',
      userId: 'user-1',
      title: 'T',
      contentJson: '{}',
      isPublic: false,
      publicSlug: null,
      createdAt: '',
      updatedAt: '',
    });

    await PATCH(makeRequest('PATCH', { title: 'T', content_json: '{}' }), { params });

    expect(mockUpdateNote).toHaveBeenCalledWith('user-1', 'note-1', 'T', '{}', undefined);
  });
});

// ─── DELETE /api/notes/[id] ───────────────────────────────────────────────────

describe('DELETE /api/notes/[id]', () => {
  const params = Promise.resolve({ id: 'note-1' });

  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await DELETE(makeRequest('DELETE'), { params });

    expect(res.status).toBe(401);
  });

  it('returns 204 on successful delete', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockDeleteNote.mockReturnValue(undefined);

    const res = await DELETE(makeRequest('DELETE'), { params });

    expect(res.status).toBe(204);
  });

  it('calls deleteNote with correct userId and noteId', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockDeleteNote.mockReturnValue(undefined);

    await DELETE(makeRequest('DELETE'), { params });

    expect(mockDeleteNote).toHaveBeenCalledWith('user-1', 'note-1');
  });
});
