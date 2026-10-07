import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { type Http, NotificationsCalls } from './notifications-calls';

function fakeHttp(answer: unknown = { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }) {
  const http = {
    get: vi.fn(() => of(answer)),
    post: vi.fn(() => of({})),
  };
  return { http, calls: new NotificationsCalls(http as unknown as Http) };
}

const params = (call: unknown[]) => (call[1] as { params: Record<string, unknown> }).params;

describe('notifications calls (notification-service.yaml 2.1.0)', () => {
  it('lists my inbox through the relative /api path the shell completes', async () => {
    const { http, calls } = fakeHttp();
    await calls.list(false, 1);
    expect(http.get.mock.calls[0]![0]).toBe('/api/v1/notifications');
    expect(params(http.get.mock.calls[0]!)).toEqual({ page: 1, limit: 20 });
  });

  it('asks only for unread ones when the filter is on', async () => {
    const { http, calls } = fakeHttp();
    await calls.list(true, 2);
    expect(params(http.get.mock.calls[0]!)).toEqual({ page: 2, limit: 20, read: 'false' });
  });

  it('counts the unread ones from meta.total, asking for a single item', async () => {
    const { http, calls } = fakeHttp({ data: [{}], meta: { page: 1, limit: 1, total: 7, totalPages: 7 } });
    await expect(calls.unreadCount()).resolves.toBe(7);
    expect(params(http.get.mock.calls[0]!)).toEqual({ read: 'false', limit: 1 });
  });

  it('marks one as read with POST and no body, escaping the id', async () => {
    const { http, calls } = fakeHttp();
    await calls.markRead('n/1');
    expect(http.post).toHaveBeenCalledWith('/api/v1/notifications/n%2F1/read', null);
  });
});
