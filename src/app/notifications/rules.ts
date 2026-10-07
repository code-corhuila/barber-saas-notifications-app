import type { AppNotification } from './types';

const MINUTE = 60_000;

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** When a notification arrived, in the phone's day: "Ahora", "Hace 5 min", "Hace 3 h", "Ayer" or the date. */
export function when(createdAt: string, now: Date = new Date()): string {
  const at = new Date(createdAt);
  const elapsed = now.getTime() - at.getTime();
  if (elapsed < MINUTE) return 'Ahora';
  if (elapsed < 60 * MINUTE) return `Hace ${Math.floor(elapsed / MINUTE)} min`;
  if (sameDay(at, now)) return `Hace ${Math.floor(elapsed / (60 * MINUTE))} h`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(at, yesterday)) return 'Ayer';
  const two = (n: number) => String(n).padStart(2, '0');
  return `${two(at.getDate())}/${two(at.getMonth() + 1)}/${at.getFullYear()}`;
}

export function unreadLabel(count: number): string {
  return count === 0 ? 'Todo al día' : `${count} sin leer`;
}

/** The list with the service's answer in place of the notification that was marked. */
export function markedRead(list: AppNotification[], answer: AppNotification): AppNotification[] {
  return list.map((n) => (n.id === answer.id ? answer : n));
}
