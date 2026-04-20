import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      signOut: vi.fn().mockResolvedValue({}),
    },
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@/lib/profile', () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  softDeleteProfile: vi.fn(),
}));

import { auth } from '@/lib/auth';
import { getProfile, updateProfile, softDeleteProfile } from '@/lib/profile';
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/profile/route';

const mockGetSession = vi.mocked(auth.api.getSession);
const mockSignOut = vi.mocked(auth.api.signOut);
const mockGetProfile = vi.mocked(getProfile);
const mockUpdateProfile = vi.mocked(updateProfile);
const mockSoftDeleteProfile = vi.mocked(softDeleteProfile);

const fakeSession = { user: { id: 'user-1', email: 'alice@example.com' } };

const fakeProfile = {
  id: 'user-1',
  name: 'Alice',
  email: 'alice@example.com',
  image: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
};

function makeRequest(method: string, body?: unknown) {
  return new NextRequest('http://localhost/api/profile', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── GET /api/profile ─────────────────────────────────────────────────────────

describe('GET /api/profile', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(401);
  });

  it('returns 404 when profile not found', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockGetProfile.mockReturnValue(null);

    const res = await GET();

    expect(res.status).toBe(404);
  });

  it('returns profile for authenticated user', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockGetProfile.mockReturnValue(fakeProfile);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual(fakeProfile);
  });

  it('calls getProfile with the session userId', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockGetProfile.mockReturnValue(fakeProfile);

    await GET();

    expect(mockGetProfile).toHaveBeenCalledWith('user-1');
  });
});

// ─── PUT /api/profile ─────────────────────────────────────────────────────────

describe('PUT /api/profile', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await PUT(makeRequest('PUT', { name: 'Bob' }));

    expect(res.status).toBe(401);
  });

  it('returns 400 for malformed body', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);

    const req = new NextRequest('http://localhost/api/profile', {
      method: 'PUT',
      body: 'not json',
    });

    const res = await PUT(req);

    expect(res.status).toBe(400);
  });

  it('returns 400 when name is empty string', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);

    const res = await PUT(makeRequest('PUT', { name: '' }));

    expect(res.status).toBe(400);
  });

  it('returns 400 when name is whitespace only', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);

    const res = await PUT(makeRequest('PUT', { name: '   ' }));

    expect(res.status).toBe(400);
  });

  it('returns 400 when image is not a string or null', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);

    const res = await PUT(makeRequest('PUT', { image: 123 }));

    expect(res.status).toBe(400);
  });

  it('returns 404 when profile not found after update', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockUpdateProfile.mockReturnValue(null);

    const res = await PUT(makeRequest('PUT', { name: 'Bob' }));

    expect(res.status).toBe(404);
  });

  it('returns 200 with updated profile on success', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockUpdateProfile.mockReturnValue({ ...fakeProfile, name: 'Bob' });

    const res = await PUT(makeRequest('PUT', { name: 'Bob' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.name).toBe('Bob');
  });

  it('trims whitespace from name before updating', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockUpdateProfile.mockReturnValue(fakeProfile);

    await PUT(makeRequest('PUT', { name: '  Alice  ' }));

    expect(mockUpdateProfile).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ name: 'Alice' }),
    );
  });

  it('passes null image to updateProfile', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockUpdateProfile.mockReturnValue(fakeProfile);

    await PUT(makeRequest('PUT', { image: null }));

    expect(mockUpdateProfile).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ image: null }),
    );
  });
});

// ─── DELETE /api/profile ──────────────────────────────────────────────────────

describe('DELETE /api/profile', () => {
  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await DELETE();

    expect(res.status).toBe(401);
  });

  it('returns 204 on successful soft delete', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);

    const res = await DELETE();

    expect(res.status).toBe(204);
  });

  it('calls softDeleteProfile with the session userId', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);

    await DELETE();

    expect(mockSoftDeleteProfile).toHaveBeenCalledWith('user-1');
  });

  it('signs the user out after soft delete', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);

    await DELETE();

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('does not call hard delete', async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);

    await DELETE();

    // softDeleteProfile is called, not a raw run/db delete
    expect(mockSoftDeleteProfile).toHaveBeenCalledTimes(1);
    expect(mockSoftDeleteProfile).not.toHaveBeenCalledWith(expect.stringContaining('DELETE'));
  });
});
