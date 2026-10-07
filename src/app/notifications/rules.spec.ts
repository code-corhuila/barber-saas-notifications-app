import { describe, expect, it } from 'vitest';
import { markedRead, unreadLabel, when } from './rules';
import type { AppNotification } from './types';

const NOW = new Date('2026-10-06T15:00:00Z');

describe('when a notification arrived, as a person reads it', () => {
  it('says "Ahora" within the first minute', () => {
    expect(when('2026-10-06T14:59:30Z', NOW)).toBe('Ahora');
  });

  it('counts minutes and hours on the same day', () => {
    expect(when('2026-10-06T14:55:00Z', NOW)).toBe('Hace 5 min');
    expect(when('2026-10-06T12:00:00Z', NOW)).toBe('Hace 3 h');
  });

  it('says "Ayer" for the day before and the date for anything older', () => {
    expect(when('2026-10-05T10:00:00Z', NOW)).toBe('Ayer');
    expect(when('2026-09-28T10:00:00Z', NOW)).toBe('28/09/2026');
  });
});

describe('the unread counter', () => {
  it('reads as a sentence in Spanish', () => {
    expect(unreadLabel(0)).toBe('Todo al día');
    expect(unreadLabel(1)).toBe('1 sin leer');
    expect(unreadLabel(12)).toBe('12 sin leer');
  });
});

describe('marking one as read in the list', () => {
  const item = (id: string, read: boolean): AppNotification => ({
    id, userId: 'u', barbershopId: null, title: 't', body: 'b', type: 'SYSTEM', read,
    createdAt: '2026-10-06T14:00:00Z', updatedAt: '2026-10-06T14:00:00Z',
  });

  it('replaces only that one with the answer of the service', () => {
    const list = [item('a', false), item('b', false)];
    const answer = { ...item('b', true), updatedAt: '2026-10-06T15:00:00Z' };

    expect(markedRead(list, answer)).toEqual([list[0], answer]);
  });
});
