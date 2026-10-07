import { Component, inject, signal } from '@angular/core';
import { IonButton, IonLabel, IonSegment, IonSegmentButton, IonSpinner } from '@ionic/angular/standalone';
import { userMessage } from '../shell-context';
import { loader } from '../ui/load';
import { PAGE_STYLES } from '../ui/styles';
import { NotificationsApi } from './notifications-api';
import { markedRead, unreadLabel, when } from './rules';
import type { AppNotification, NotificationType } from './types';

const KIND: Record<NotificationType, string> = {
  APPOINTMENT_CONFIRMATION: 'Cita',
  REMINDER: 'Recordatorio',
  PROMOTION: 'Promoción',
  SYSTEM: 'Aviso',
};

/**
 * The inbox of the signed-in user (FR-020 to FR-022): their notifications, most recent first, the
 * unread ones set apart. Opening an unread one marks it as read.
 */
@Component({
  selector: 'nt-inbox-page',
  imports: [IonButton, IonLabel, IonSegment, IonSegmentButton, IonSpinner],
  template: `
    <section class="page">
      <h1>Notificaciones</h1>
      <p class="sub" aria-live="polite">{{ unread() === null ? ' ' : unreadText() }}</p>
      <ion-segment [value]="onlyUnread() ? 'unread' : 'all'" (ionChange)="filter($event.detail.value)">
        <ion-segment-button value="all"><ion-label>Todas</ion-label></ion-segment-button>
        <ion-segment-button value="unread"><ion-label>No leídas</ion-label></ion-segment-button>
      </ion-segment>
      @if (markError()) { <p class="error" role="alert">{{ markError() }}</p> }
      @switch (list.state().kind) {
        @case ('loading') { <div class="center"><ion-spinner aria-label="Cargando" /></div> }
        @case ('error') {
          <div class="center"><p class="error">{{ errorText() }}</p><ion-button (click)="refresh()">Intentar de nuevo</ion-button></div>
        }
        @case ('empty') {
          <p class="center">{{ onlyUnread() ? 'No tienes notificaciones sin leer.' : 'Aún no tienes notificaciones.' }}</p>
        }
        @case ('data') {
          @for (n of items(); track n.id) {
            <button type="button" class="card note" [class.unread]="!n.read" (click)="open(n)"
                    [attr.aria-label]="(n.read ? '' : 'Sin leer. ') + n.title + '. ' + n.body">
              <div class="row">
                <span class="kind">{{ kind[n.type] }}</span>
                <span class="muted">{{ when(n.createdAt) }}</span>
              </div>
              <h2>@if (!n.read) { <span class="dot" aria-hidden="true"></span> }{{ n.title }}</h2>
              <p class="muted">{{ n.body }}</p>
            </button>
          }
          @if (page() < pages()) {
            <div class="center">
              @if (moreError()) { <p class="error">{{ moreError() }}</p> }
              <ion-button fill="outline" [disabled]="loadingMore()" (click)="more()">
                {{ loadingMore() ? 'Cargando…' : 'Ver más' }}
              </ion-button>
            </div>
          }
        }
      }
    </section>
  `,
  styles: PAGE_STYLES + `
    .note { width: 100%; text-align: left; border: 0; font: inherit; cursor: pointer; border-left: 4px solid transparent; }
    .note.unread { border-left-color: #d4af37; background: #232017; }
    .note.unread h2 { color: #fff; }
    .note:not(.unread) h2 { color: #ccc; font-weight: 500; }
    .kind { color: #d4af37; font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
    .dot { display: inline-block; width: .55rem; height: .55rem; border-radius: 50%; background: #d4af37;
           margin-right: .4rem; vertical-align: middle; }
  `,
})
export class InboxPageComponent {
  private readonly api = inject(NotificationsApi);
  readonly kind = KIND;
  readonly when = when;
  readonly onlyUnread = signal(false);
  readonly items = signal<AppNotification[]>([]);
  readonly page = signal(1);
  readonly pages = signal(0);
  readonly unread = signal<number | null>(null);
  readonly loadingMore = signal(false);
  readonly moreError = signal<string | null>(null);
  readonly markError = signal<string | null>(null);
  readonly list = loader(async () => {
    const first = await this.api.list(this.onlyUnread(), 1);
    this.items.set(first.data);
    this.page.set(1);
    this.pages.set(first.meta.totalPages);
    return first;
  }, (p) => p.data.length === 0);

  constructor() {
    void this.refresh();
  }

  unreadText(): string {
    return unreadLabel(this.unread() ?? 0);
  }

  errorText(): string {
    const s = this.list.state();
    return s.kind === 'error' ? s.message : '';
  }

  async refresh(): Promise<void> {
    this.markError.set(null);
    await Promise.all([this.list.run(), this.countUnread()]);
  }

  filter(value: unknown): void {
    this.onlyUnread.set(value === 'unread');
    void this.list.run();
  }

  async more(): Promise<void> {
    this.loadingMore.set(true);
    this.moreError.set(null);
    try {
      const next = await this.api.list(this.onlyUnread(), this.page() + 1);
      this.items.update((list) => [...list, ...next.data.filter((n) => !list.some((m) => m.id === n.id))]);
      this.page.set(next.meta.page);
      this.pages.set(next.meta.totalPages);
    } catch (err) {
      this.moreError.set(userMessage(err));
    } finally {
      this.loadingMore.set(false);
    }
  }

  async open(n: AppNotification): Promise<void> {
    if (n.read) return;
    this.markError.set(null);
    try {
      const answer = await this.api.markRead(n.id);
      this.items.update((list) => markedRead(list, answer));
      this.unread.update((count) => (count === null ? null : Math.max(0, count - 1)));
    } catch (err) {
      this.markError.set(userMessage(err));
    }
  }

  private async countUnread(): Promise<void> {
    try {
      this.unread.set(await this.api.unreadCount());
    } catch {
      this.unread.set(null);
    }
  }
}
