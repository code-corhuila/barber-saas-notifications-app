import { Observable, firstValueFrom } from 'rxjs';
import type { AppNotification, Page } from './types';

/** The part of HttpClient this app uses: plain params, so the calls test without Angular. */
export interface Http {
  get<T>(url: string, options?: { params?: Record<string, string | number> }): Observable<T>;
  post<T>(url: string, body: unknown): Observable<T>;
}

const BASE = '/api/v1/notifications';
export const PAGE_SIZE = 20;

/**
 * The calls of `notification-service.yaml` for any signed-in user: only their own notifications
 * (the service takes the user from the token). Relative '/api/...' URLs: the shell's interceptor
 * adds the gateway, the token and X-Correlation-Id.
 */
export class NotificationsCalls {
  constructor(private readonly http: Http) {}

  /** Most recent first; `onlyUnread` sends `read=false`. */
  list(onlyUnread: boolean, page: number): Promise<Page<AppNotification>> {
    const params: Record<string, string | number> = { page, limit: PAGE_SIZE, ...(onlyUnread ? { read: 'false' } : {}) };
    return firstValueFrom(this.http.get<Page<AppNotification>>(BASE, { params }));
  }

  /** The number for the bell: one item is enough, `meta.total` counts them all. */
  async unreadCount(): Promise<number> {
    const page = await firstValueFrom(this.http.get<Page<AppNotification>>(BASE, { params: { read: 'false', limit: 1 } }));
    return page.meta.total;
  }

  /** Idempotent: an already read notification answers 200 unchanged. */
  markRead(notificationId: string): Promise<AppNotification> {
    return firstValueFrom(this.http.post<AppNotification>(`${BASE}/${encodeURIComponent(notificationId)}/read`, null));
  }
}
