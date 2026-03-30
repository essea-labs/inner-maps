import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase-admin before importing the route
const mockInsert = vi.fn();
vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdmin: () => ({
    from: () => ({ insert: mockInsert }),
  }),
}));

import { POST } from '@/app/api/feedback/route';

function makeRequest(body: any) {
  return new Request('http://localhost/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/feedback', () => {
  beforeEach(() => {
    mockInsert.mockReset();
    mockInsert.mockResolvedValue({ error: null });
  });

  it('returns 400 when message is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Message is required');
  });

  it('returns 400 when message is empty string', async () => {
    const res = await POST(makeRequest({ message: '   ' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Message is required');
  });

  it('returns 400 when message exceeds 2000 characters', async () => {
    const res = await POST(makeRequest({ message: 'a'.repeat(2001) }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Message too long (max 2000 characters)');
  });

  it('inserts feedback with message only', async () => {
    const res = await POST(makeRequest({ message: 'Great app!' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith({
      message: 'Great app!',
      email: null,
      page: null,
    });
  });

  it('inserts feedback with email and page', async () => {
    const res = await POST(makeRequest({
      message: 'Bug report',
      email: 'user@test.com',
      page: 'results',
    }));
    expect(res.status).toBe(200);
    expect(mockInsert).toHaveBeenCalledWith({
      message: 'Bug report',
      email: 'user@test.com',
      page: 'results',
    });
  });

  it('trims whitespace from message and email', async () => {
    const res = await POST(makeRequest({
      message: '  feedback  ',
      email: '  user@test.com  ',
    }));
    expect(res.status).toBe(200);
    expect(mockInsert).toHaveBeenCalledWith({
      message: 'feedback',
      email: 'user@test.com',
      page: null,
    });
  });

  it('returns 500 when database insert fails', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'DB error' } });
    const res = await POST(makeRequest({ message: 'test' }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Could not save feedback');
  });
});
