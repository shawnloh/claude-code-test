import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the db module before importing notes
vi.mock('@/lib/db', () => ({
  query: vi.fn(),
  get: vi.fn(),
  run: vi.fn(),
}));

import { query, get, run } from '@/lib/db';
import { getNotesByUser, getNoteById, updateNote, deleteNote, getNoteBySlug } from '@/lib/notes';

const mockQuery = vi.mocked(query);
const mockGet = vi.mocked(get);
const mockRun = vi.mocked(run);

const sampleRow = {
  id: 'note-1',
  user_id: 'user-1',
  title: 'Test Note',
  content_json: '{"type":"doc"}',
  is_public: 0,
  public_slug: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

const expectedNote = {
  id: 'note-1',
  userId: 'user-1',
  title: 'Test Note',
  contentJson: '{"type":"doc"}',
  isPublic: false,
  publicSlug: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getNotesByUser', () => {
  it('returns mapped notes and total count', () => {
    mockQuery.mockReturnValue([sampleRow]);
    mockGet.mockReturnValue({ count: 1 });

    const result = getNotesByUser('user-1');

    expect(result.notes).toHaveLength(1);
    expect(result.notes[0]).toEqual(expectedNote);
    expect(result.total).toBe(1);
  });

  it('uses default limit=20 and offset=0', () => {
    mockQuery.mockReturnValue([]);
    mockGet.mockReturnValue({ count: 0 });

    getNotesByUser('user-1');

    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['user-1', 20, 0]);
  });

  it('passes custom limit and offset', () => {
    mockQuery.mockReturnValue([]);
    mockGet.mockReturnValue({ count: 0 });

    getNotesByUser('user-1', 5, 10);

    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['user-1', 5, 10]);
  });

  it('returns total=0 when count row is undefined', () => {
    mockQuery.mockReturnValue([]);
    mockGet.mockReturnValue(undefined);

    const result = getNotesByUser('user-1');

    expect(result.total).toBe(0);
  });

  it('maps is_public=1 to isPublic=true', () => {
    mockQuery.mockReturnValue([{ ...sampleRow, is_public: 1, public_slug: 'abc' }]);
    mockGet.mockReturnValue({ count: 1 });

    const result = getNotesByUser('user-1');

    expect(result.notes[0].isPublic).toBe(true);
    expect(result.notes[0].publicSlug).toBe('abc');
  });
});

describe('getNoteById', () => {
  it('returns mapped note when found', () => {
    mockGet.mockReturnValue(sampleRow);

    const result = getNoteById('user-1', 'note-1');

    expect(result).toEqual(expectedNote);
    expect(mockGet).toHaveBeenCalledWith(expect.any(String), ['note-1', 'user-1']);
  });

  it('returns null when note not found', () => {
    mockGet.mockReturnValue(undefined);

    const result = getNoteById('user-1', 'missing');

    expect(result).toBeNull();
  });

  it('enforces ownership — passes both noteId and userId to query', () => {
    mockGet.mockReturnValue(undefined);

    getNoteById('user-2', 'note-1');

    expect(mockGet).toHaveBeenCalledWith(expect.any(String), ['note-1', 'user-2']);
  });
});

describe('deleteNote', () => {
  it('calls run with correct SQL and params', () => {
    deleteNote('user-1', 'note-1');

    expect(mockRun).toHaveBeenCalledWith(expect.stringContaining('DELETE'), ['note-1', 'user-1']);
  });

  it('scopes delete to the owner', () => {
    deleteNote('user-2', 'note-1');

    const [, params] = mockRun.mock.calls[0];
    expect(params).toContain('user-2');
    expect(params).toContain('note-1');
  });
});

describe('getNoteBySlug', () => {
  it('returns mapped note when slug exists and note is public', () => {
    const publicRow = { ...sampleRow, is_public: 1, public_slug: 'my-slug' };
    mockGet.mockReturnValue(publicRow);

    const result = getNoteBySlug('my-slug');

    expect(result).not.toBeNull();
    expect(result!.isPublic).toBe(true);
    expect(result!.publicSlug).toBe('my-slug');
  });

  it('returns null when slug not found', () => {
    mockGet.mockReturnValue(undefined);

    const result = getNoteBySlug('bad-slug');

    expect(result).toBeNull();
  });

  it('queries with slug and is_public check', () => {
    mockGet.mockReturnValue(undefined);

    getNoteBySlug('test-slug');

    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('is_public'), ['test-slug']);
  });
});

describe('updateNote', () => {
  it('updates without touching is_public when isPublic is undefined', () => {
    // getNoteById call after update
    mockGet.mockReturnValue(sampleRow);

    updateNote('user-1', 'note-1', 'New Title', '{"type":"doc"}');

    // Only one run call (no slug logic)
    expect(mockRun).toHaveBeenCalledTimes(1);
    const sql = mockRun.mock.calls[0][0] as string;
    expect(sql).not.toMatch(/is_public/);
  });

  it('generates a new slug when making note public without existing slug', () => {
    // First mockGet: getNoteById inside updateNote (existing note has no slug)
    // Second mockGet: getNoteById at the end (return updated note)
    mockGet
      .mockReturnValueOnce({ ...sampleRow, is_public: 0, public_slug: null })
      .mockReturnValueOnce({ ...sampleRow, is_public: 1, public_slug: 'generated-slug' });

    const result = updateNote('user-1', 'note-1', 'Title', '{}', true);

    expect(mockRun).toHaveBeenCalledTimes(1);
    const sql = mockRun.mock.calls[0][0] as string;
    expect(sql).toMatch(/is_public = 1/);
    expect(result?.isPublic).toBe(true);
  });

  it('reuses existing slug when note is already public', () => {
    const existingSlug = 'existing-slug';
    mockGet
      .mockReturnValueOnce({ ...sampleRow, is_public: 1, public_slug: existingSlug })
      .mockReturnValueOnce({ ...sampleRow, is_public: 1, public_slug: existingSlug });

    updateNote('user-1', 'note-1', 'Title', '{}', true);

    const params = mockRun.mock.calls[0][1] as unknown[];
    expect(params).toContain(existingSlug);
  });

  it('clears slug when disabling sharing', () => {
    mockGet.mockReturnValue(sampleRow);

    updateNote('user-1', 'note-1', 'Title', '{}', false);

    const sql = mockRun.mock.calls[0][0] as string;
    expect(sql).toMatch(/is_public = 0/);
    expect(sql).toMatch(/public_slug = NULL/);
  });

  it('returns null when note not found after update', () => {
    // Simulate note not owned by user
    mockGet.mockReturnValue(undefined);

    const result = updateNote('user-1', 'note-999', 'Title', '{}');

    expect(result).toBeNull();
  });
});
